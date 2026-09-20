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
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
        {labeled && <span>Instagram</span>}
      </a>
      <a
        href={business.facebook}
        target="_blank"
        rel="noreferrer"
        aria-label="Strike A Pose on Facebook"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V4a22 22 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3.7Z" />
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
