"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["Backdrops", "/backdrops"],
  ["Gallery", "/gallery"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  return (
    <header className="site-header">
      <nav
        className="nav-inner"
        aria-label="Main navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <Link
          href="/"
          className="brand"
          aria-label="Strike A Pose home"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo-1.webp"
            alt="Strike A Pose Photo Booth & Party Services"
            width={150}
            height={90}
            priority
          />
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-links"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close ×" : "Menu ☰"}
        </button>
        <div id="main-links" className={`nav-links ${open ? "is-open" : ""}`}>
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={path === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="button gold nav-book"
            aria-current={path === "/contact" ? "page" : undefined}
          >
            Contact & Book Now <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
