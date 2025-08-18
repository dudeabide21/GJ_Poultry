import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // 1. Latest reading
  const { data: latestArr, error: latestErr } = await supabase
    .from("sensor_readings")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1);

  if (latestErr) {
    console.error("Supabase latest error:", latestErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }
  const latest = latestArr[0] || null;

  // 2. History
  const { data: histArr, error: histErr } = await supabase
    .from("sensor_readings")
    .select("timestamp, temperature, humidity, co2_ppm")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (histErr) {
    console.error("Supabase history error:", histErr);
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }
  const history = histArr.reverse();

  return NextResponse.json({ latest, history });
}
