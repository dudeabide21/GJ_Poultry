import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Fetch all categories (to preserve empty ones)...
  const { data: categories, error: catErr } = await supabase
    .from("weight_categories")
    .select("category_key")
    .order("sort_order", { ascending: true });

  if (catErr) {
    console.error("Supabase categories error:", catErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }

  // Fetch all weights...
  const { data: weights, error: wErr } = await supabase
    .from("chicken_weights")
    .select("category_key, weight_grams");

  if (wErr) {
    console.error("Supabase weights error:", wErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }

  // Aggregate
  const bucket = {};
  weights.forEach(({ category_key, weight_grams }) => {
    if (!bucket[category_key]) bucket[category_key] = { total: 0, count: 0 };
    bucket[category_key].total += weight_grams;
    bucket[category_key].count += 1;
  });

  const result = categories.map(({ category_key }) => {
    const stats = bucket[category_key] || { total: 0, count: 0 };
    return {
      category_key,
      average_weight: stats.count ? stats.total / stats.count : null,
      chicken_count: stats.count,
    };
  });

  return NextResponse.json(result);
}
