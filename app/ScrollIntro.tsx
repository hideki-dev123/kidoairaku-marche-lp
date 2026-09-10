import type { ReactNode } from "react";

export default function ScrollIntro({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-intro">
      <span id="top" className="intro-destination" aria-hidden="true" />
      <div className="intro-stage">
        <div className="intro-hero">{children}</div>
        <div className="intro-film" aria-hidden="true">
          <video muted playsInline preload="auto" poster="/videos/marche-intro-poster.jpg">
            <source src="/videos/marche-intro-scrub.mp4" type="video/mp4" />
          </video>
        </div>
        <button className="intro-skip" type="button">イントロをスキップ ↓</button>
      </div>
      <noscript><style>{`
        .scroll-intro{height:auto!important}
        .intro-stage{position:relative!important}
        .intro-film,.intro-skip{display:none!important}
        .intro-hero,.intro-hero .hero-copy>*{opacity:1!important;transform:none!important;visibility:visible!important}
        .intro-destination{top:0!important}
        main:has(.scroll-intro) .topbar,main:has(.scroll-intro) .mobile-cta{opacity:1!important;visibility:visible!important}
      `}</style></noscript>
    </div>
  );
}
