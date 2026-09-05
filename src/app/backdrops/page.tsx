import { redirect } from "next/navigation";

/** The backdrop collection now lives with the service and inquiry flow. */
export default function Backdrops() {
  redirect("/services#backdrops");
}
