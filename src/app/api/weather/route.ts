import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Read the OpenWeather API key from env. Try both server-only and public names.
    const apiKey =
      process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENWEATHER_API_KEY / NEXT_PUBLIC_OPENWEATHER_API_KEY" },
        { status: 500 }
      );
    }

    const lat = 6.69; // Kumasi
    const lon = -1.62;

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Failed to load weather" },
      { status: 500 }
    );
  }
}
