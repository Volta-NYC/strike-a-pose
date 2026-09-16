"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/lib/components/site-ui";
import { backdrops } from "@/lib/site-data";

export default function BackdropSelector() {
  const [selectedBackdrop, setSelectedBackdrop] = useState<string | null>(null);
  return (
    <>
      <div className="backdrop-grid">
        {backdrops.map(([name, image]) => {
          const selected = selectedBackdrop === name;
          return (
            <article key={name} className={selected ? "is-selected" : ""}>
              <label className="backdrop-choice-card">
                <Photo src={image} alt={`${name} photo booth backdrop`} contain />
                <span className="backdrop-choice-name">
                  <input type="checkbox" checked={selected} onChange={() => setSelectedBackdrop(selected ? null : name)} />
                  <span>{name}</span>
                </span>
              </label>
            </article>
          );
        })}
      </div>
      <div className="backdrop-selection-action" aria-live="polite">
        {selectedBackdrop ? (
          <>
            <p><strong>{selectedBackdrop}</strong> selected for your event.</p>
            <Link href={`/contact?backdrop=${encodeURIComponent(selectedBackdrop)}`} className="button gold">
              Continue to Book Now <span aria-hidden="true">↗</span>
            </Link>
          </>
        ) : <p>Select a backdrop to add it to your booking inquiry.</p>}
      </div>
    </>
  );
}
