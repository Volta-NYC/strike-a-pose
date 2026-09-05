import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/lib/components/navbar";
import Footer from "@/lib/components/footer";
import MotionOrchestrator from "@/lib/components/motion-orchestrator";
export const metadata: Metadata = {
  title: {
    default: "Strike A Pose | Photo Booth & Event Experiences",
    template: "%s | Strike A Pose",
  },
  description:
    "Premium Nova DSLR, Mirror and 360 photo booths, audio guest books, and event extras. Serving NYC, Long Island, Westchester, Northern NJ, and Connecticut.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MotionOrchestrator />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
