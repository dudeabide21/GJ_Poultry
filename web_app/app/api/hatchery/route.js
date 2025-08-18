// app/api/hatchery/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_HISTORY = 100;

export async function POST(request) {
  console.log("POST /api/hatchery");

  const body = await request.json();
  const { temperature, humidity, trolleys } = body;

  // Validate payload
  if (
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    !Array.isArray(trolleys) ||
    trolleys.length !== 6 ||
    !trolleys.every((t) => typeof t === "number")
  ) {
    console.warn("Invalid hatchery payload:", body);
    return NextResponse.json(
      { error: "Invalid hatchery data" },
      { status: 400 }
    );
  }

  // Use server timestamp
  const serverTimestamp = new Date().toISOString();

  const { error: insertError } = await supabase
    .from("hatchery_readings")
    .insert([
      {
        timestamp: serverTimestamp,
        temperature,
        humidity,
        trolleys,
      },
    ]);

  if (insertError) {
    console.error("Supabase insert error (/api/hatchery):", insertError);
    return NextResponse.json(
      { error: "Failed to write hatchery data" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Hatchery data stored",
      timestamp: serverTimestamp,
    },
    { status: 201 }
  );
}

export async function GET() {
  console.log("GET /api/hatchery");

  const { data, error: fetchError } = await supabase
    .from("hatchery_readings")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(MAX_HISTORY);

  if (fetchError) {
    console.error("Supabase fetch error (/api/hatchery):", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch hatchery data" },
      { status: 500 }
    );
  }

  // Return in chronological order
  return NextResponse.json(data.reverse());
}
