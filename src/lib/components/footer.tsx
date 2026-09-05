import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/site-data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-invitation container">
        <p>Make room for the memory.</p>
        <Link href="/contact" className="button gold">
          Start your inquiry <span aria-hidden="true">↗</span>
        </Link>
      </div>
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
          <p>Photo booth and party experiences for the moments worth replaying.</p>
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
            <span className="instagram-mark" aria-hidden="true">◎</span>
            @strikeapose5262026
          </a>
        </div>
        <div className="footer-links">
          <p className="footer-label">Explore</p>
          <Link href="/services">Experiences</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/gallery">The gallery</Link>
          <Link href="/contact">Contact & book</Link>
        </div>
        <div className="footer-location">
          <p className="footer-label">Serving the party</p>
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
