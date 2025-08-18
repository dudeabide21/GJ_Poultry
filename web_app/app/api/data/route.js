import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sanitizeSensorValue } from "@/lib/utils";

export async function POST(request) {
  console.log("POST /api/data");

  const secret = request.headers.get("x-device-secret");
  if (secret !== process.env.DEVICE_SECRET) {
    console.log("Unauthorized device secret:", secret);
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  let { temperature, humidity, nh3, weight, lux, co2_ppm } = body;

  temperature = sanitizeSensorValue(temperature);
  humidity = sanitizeSensorValue(humidity);
  nh3 = sanitizeSensorValue(nh3);
  weight = sanitizeSensorValue(weight);
  lux = sanitizeSensorValue(lux);
  co2_ppm = sanitizeSensorValue(co2_ppm, -1);

  console.log("Received sensor data:", {
    timestamp: new Date().toISOString(),
    temperature,
    humidity,
    nh3,
    weight,
    lux,
    co2_ppm,
  });

  // If you want to write to Supabase, uncomment:
  const { error } = await supabase
    .from("sensor_readings")
    .insert([
      {
        timestamp: new Date(),
        temperature,
        humidity,
        nh3,
        weight,
        lux,
        co2_ppm,
      },
    ]);
  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, logged: true }, { status: 201 });
}
