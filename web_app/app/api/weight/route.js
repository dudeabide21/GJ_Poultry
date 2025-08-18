import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEBOUNCE_THRESHOLD = 50.0;
const DEBOUNCE_WINDOW = 10 * 60 * 1000; // 10 minutes in ms

export async function POST(request) {
  console.log("POST /api/weight");

  const secret = request.headers.get("x-device-secret");
  if (secret !== process.env.DEVICE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { weight } = await request.json();
  if (typeof weight !== "number" || weight < 500) {
    return NextResponse.json(
      { error: "Invalid weight data." },
      { status: 400 }
    );
  }

  // 1. Find matching category
  const { data: catRows, error: catErr } = await supabase
    .from("weight_categories")
    .select("category_key")
    .gte("min_weight_grams", weight)
    .lte("max_weight_grams", weight)
    .limit(1);

  if (catErr) {
    console.error("Supabase category query error:", catErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }
  if (!catRows.length) {
    return NextResponse.json({ message: "Weight out of range, ignored." });
  }
  const category = catRows[0].category_key;

  // 2. Debounce: fetch recent weights
  const windowStart = new Date(Date.now() - DEBOUNCE_WINDOW).toISOString();
  const { data: recentRows, error: recentErr } = await supabase
    .from("chicken_weights")
    .select("weight_grams")
    .eq("category_key", category)
    .gt("recorded_at", windowStart);

  if (recentErr) {
    console.error("Supabase recent weights error:", recentErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }
  if (
    recentRows.some(
      (r) => Math.abs(r.weight_grams - weight) <= DEBOUNCE_THRESHOLD
    )
  ) {
    return NextResponse.json({ message: "Duplicate weight ignored." });
  }

  // 3. Insert new weight
  const { error: insertErr } = await supabase
    .from("chicken_weights")
    .insert([{ weight_grams: weight, category_key: category }]);

  if (insertErr) {
    console.error("Supabase insert error:", insertErr);
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }

  // 4. Compute averages & counts in code
  const { data: allRows, error: allErr } = await supabase
    .from("chicken_weights")
    .select("category_key, weight_grams");

  if (allErr) {
    console.error("Supabase fetch-all error:", allErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }

  const stats = allRows.reduce((acc, { category_key, weight_grams }) => {
    if (!acc[category_key]) acc[category_key] = { total: 0, count: 0 };
    acc[category_key].total += weight_grams;
    acc[category_key].count += 1;
    return acc;
  }, {});

  const averages = Object.entries(stats).map(([key, { total, count }]) => ({
    category_key: key,
    average_weight: total / count,
    chicken_count: count,
  }));

  return NextResponse.json({ success: true, averages }, { status: 201 });
}
