import { redirect } from "next/navigation";

export default function Weather() {
  redirect("/dashboard/weather/weather-data");
}
