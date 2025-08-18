// app/api/hatchery/weight/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_ENTRIES = 100;

export async function POST(request) {
  try {
    const { weight } = await request.json();
    const timestamp = new Date().toISOString();

    if (typeof weight !== "number") {
      console.warn("Invalid weight data:", weight);
      return NextResponse.json(
        { error: "Invalid weight data" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("hatchery_weights")
      .insert([{ weight, timestamp }]);

    if (insertError) {
      console.error(
        "Supabase insert error (/api/hatchery/weight):",
        insertError
      );
      return NextResponse.json(
        { error: "Failed to write weight data" },
        { status: 500 }
      );
    }

    console.log(
      `[${timestamp}] POST /api/hatchery/weight - Stored weight: ${weight} kg`
    );
    return NextResponse.json(
      { message: "Weight data received", weight, timestamp },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in /api/hatchery/weight POST:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error: fetchError } = await supabase
      .from("hatchery_weights")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(MAX_ENTRIES);

    if (fetchError) {
      console.error("Supabase fetch error (/api/hatchery/weight):", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch weight data" },
        { status: 500 }
      );
    }

    // return oldest→newest
    return NextResponse.json(data.reverse());
  } catch (err) {
    console.error("Error in /api/hatchery/weight GET:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
