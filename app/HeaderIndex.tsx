"use client";

import { useEffect, useRef } from "react";

const sections = [
  { href: "#about", label: "マルシェについて" },
  { href: "#gallery", label: "前回の様子" },
  { href: "#experience", label: "できること" },
  { href: "#voices", label: "参加者の声" },
  { href: "#outline", label: "開催概要・料金" },
  { href: "#faq", label: "よくある質問" },
];

export default function HeaderIndex() {
  const indexRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const index = indexRef.current;
      if (index?.open && event.target instanceof Node && !index.contains(event.target)) index.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const index = indexRef.current;
      if (event.key === "Escape" && index?.open) {
        index.open = false;
        index.querySelector<HTMLElement>("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    if (indexRef.current) indexRef.current.dataset.ready = "true";
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <>
    <nav className="desktop-index" aria-label="ページ内の目次">
      {sections.map(({ href, label }) => <a href={href} key={href}>{label}</a>)}
    </nav>
    <details className="header-index" ref={indexRef}>
      <summary><span>目次</span><span className="index-icon" aria-hidden="true"><i /><i /></span></summary>
      <div className="index-panel">
        <p className="index-kicker">CONTENTS <span>ページの目次</span></p>
        <nav aria-label="ページ内の目次">
          {sections.map(({ href, label }, i) => <a href={href} key={href} onClick={() => { if (indexRef.current) indexRef.current.open = false; }}><span className="index-number">0{i + 1}</span><span>{label}</span><span className="index-arrow" aria-hidden="true">↓</span></a>)}
        </nav>
      </div>
    </details>
    <a className="cta header-cta" href="#entry">申し込む<span aria-hidden="true">↓</span></a>
  </>;
}

