"use client";

import { useEffect, useRef } from "react";

const REVEAL_SELECTOR = [
  ".section-head",
  ".manifesto-text",
  ".side-note",
  ".about-copy",
  ".image-stack",
  ".values article",
  ".gallery figure",
  ".fit-list > div",
  ".fit-note",
  ".experience-track article",
  ".schedule-note",
  ".voice-stats",
  ".note",
  ".outline-card",
  ".prices article",
  ".faq details",
  ".final-copy",
].join(",");

export default function MotionExperience() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const topbar = document.querySelector<HTMLElement>(".topbar");
    const hero = document.querySelector<HTMLElement>(".hero");
    const heroArt = document.querySelector<HTMLElement>(".hero-brand-art");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    const parallaxImages = Array.from(
      document.querySelectorAll<HTMLElement>(".image-stack img, .gallery figure img, .final-cta > img"),
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--motion-delay", `${(index % 5) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );

    revealTargets.forEach((element) => observer.observe(element));
    root.classList.add("motion-ready");

    let frame = 0;
    const updateScrollMotion = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(scrollY / maxScroll, 1);

      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      topbar?.classList.toggle("is-scrolled", scrollY > 24);
      heroArt?.style.setProperty("--scroll-shift", `${Math.min(scrollY * 0.075, 62)}px`);

      parallaxImages.forEach((image) => {
        const parent = image.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
        const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const shift = Math.max(-24, Math.min(24, centerOffset * -32));
        image.style.setProperty("--parallax-y", `${shift}px`);
      });
    };

    const requestScrollMotion = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollMotion);
    };

    const updatePointerMotion = (event: PointerEvent) => {
      if (!hero || !heroArt || event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      heroArt.style.setProperty("--pointer-x", `${x}px`);
      heroArt.style.setProperty("--pointer-y", `${y}px`);
    };

    const resetPointerMotion = () => {
      heroArt?.style.setProperty("--pointer-x", "0px");
      heroArt?.style.setProperty("--pointer-y", "0px");
    };

    window.addEventListener("scroll", requestScrollMotion, { passive: true });
    window.addEventListener("resize", requestScrollMotion);
    hero?.addEventListener("pointermove", updatePointerMotion);
    hero?.addEventListener("pointerleave", resetPointerMotion);
    updateScrollMotion();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestScrollMotion);
      window.removeEventListener("resize", requestScrollMotion);
      hero?.removeEventListener("pointermove", updatePointerMotion);
      hero?.removeEventListener("pointerleave", resetPointerMotion);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("motion-ready");
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <div className="ambient-canvas" aria-hidden="true">
        <i className="ambient-orb orb-one" />
        <i className="ambient-orb orb-two" />
      </div>
    </>
  );
}
