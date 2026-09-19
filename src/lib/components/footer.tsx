import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/site-data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Strike A Pose home">
            <Image
              src="/images/logo-transparent.png"
              alt="Strike A Pose"
              width={180}
              height={108}
            />
          </Link>
          <p>Creating Memories, One Pose at a Time.</p>
        </div>
        <div className="footer-contact">
          <p className="footer-label">Let’s celebrate</p>
          <a className="footer-phone" href={business.phoneHref}>
            {business.phone}
          </a>
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <a
            className="social-link"
            href={business.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <svg
              className="instagram-mark"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>
          <a
            className="social-link"
            href={business.facebook}
            target="_blank"
            rel="noreferrer"
          >
            <svg
              className="facebook-mark"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V4a22 22 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v8h3.7Z" />
            </svg>
            Facebook
          </a>
        </div>
        <div className="footer-location">
          <p className="footer-label">Service Areas</p>
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
