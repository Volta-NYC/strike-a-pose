"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { business } from "@/lib/site-data";

type SocialLinksProps = { labeled?: boolean };

function SocialLinks({ labeled = false }: SocialLinksProps) {
  return (
    <div className="footer-socials" aria-label="Strike A Pose social links">
      <a
        href={business.instagram}
        target="_blank"
        rel="noreferrer"
        aria-label="Strike A Pose on Instagram"
      >
        <svg className="social-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.4 2h9.2A5.4 5.4 0 0 1 22 7.4v9.2a5.4 5.4 0 0 1-5.4 5.4H7.4A5.4 5.4 0 0 1 2 16.6V7.4A5.4 5.4 0 0 1 7.4 2Zm-.2 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm9.95 1.55a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 6.8A5.2 5.2 0 1 1 6.8 12 5.2 5.2 0 0 1 12 6.8Zm0 2A3.2 3.2 0 1 0 15.2 12 3.2 3.2 0 0 0 12 8.8Z" />
        </svg>
        {labeled && <span>Instagram</span>}
      </a>
      <a
        href={business.facebook}
        target="_blank"
        rel="noreferrer"
        aria-label="Strike A Pose on Facebook"
      >
        <svg className="social-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 22v-8h2.8l.42-3.1H13.5V8.92c0-.9.27-1.51 1.57-1.51h1.68V4.64A22.9 22.9 0 0 0 14.3 4c-2.43 0-4.1 1.48-4.1 4.2v2.7H7.45V14h2.76v8h3.29Z" />
        </svg>
        {labeled && <span>Facebook</span>}
      </a>
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact" || pathname === "/contact-request-a-quote";

  return (
    <footer className={`site-footer ${isContactPage ? "site-footer--contact" : "site-footer--full"}`}>
      {isContactPage ? (
        <div className="container footer-contact-layout">
          <Link className="footer-contact-brand" href="/" aria-label="Strike A Pose home">
            <Image src="/images/logo-transparent.png" alt="Strike A Pose" width={220} height={132} />
          </Link>
          <div className="footer-contact-message">
            <p>Creating Memories, One Pose at a Time.</p>
            <div>
              <a href={business.phoneHref}>{business.phone}</a>
              <span aria-hidden="true">|</span>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </div>
          </div>
          <SocialLinks />
        </div>
      ) : (
        <div className="container footer-full-layout">
          <Link className="footer-full-brand" href="/" aria-label="Strike A Pose home">
            <Image src="/images/logo-transparent.png" alt="Strike A Pose" width={180} height={108} />
          </Link>
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <a href={business.phoneHref}>{business.phone}</a>
          <p className="footer-tagline">Creating Memories, One Pose at a Time.</p>
          <p className="footer-service-areas">NYC (Manhattan, Bronx, Brooklyn, Queens &amp; Staten Island) • Long Island • Westchester • Northern NJ • Connecticut • Pennsylvania</p>
          <SocialLinks />
        </div>
      )}
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Strike A Pose. All Rights Reserved.</span>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <a href="https://novusnyc.org" target="_blank" rel="noreferrer">Made by Novus</a>
        </div>
      </div>
    </footer>
  );
}
