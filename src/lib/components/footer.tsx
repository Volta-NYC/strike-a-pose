import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/site-data";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/">
            <Image
              src="/images/logo-1.webp"
              alt="Strike A Pose"
              width={180}
              height={108}
            />
          </Link>
          <p>Capture fun. Strike a pose.</p>
        </div>
        <div>
          <h2>Let’s celebrate</h2>
          <a href={business.phoneHref}>{business.phone}</a>
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <a
            className="social-link"
            href={business.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="18" cy="6" r=".8" />
            </svg>{" "}
            @strikeapose5262026
          </a>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/services">Our experiences</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/backdrops">Backdrops</Link>
          <Link href="/gallery">Event gallery</Link>
        </div>
        <div>
          <h2>Where we celebrate</h2>
          <p>{business.area}</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Strike A Pose</span>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <a href="https://novusnyc.org" target="_blank" rel="noreferrer">
            Made by Novus
          </a>
        </div>
      </div>
    </footer>
  );
}
