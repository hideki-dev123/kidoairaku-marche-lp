import { clamp01, introTimeline } from "./intro-timeline";

/** Shares MotionExperience's rAF scheduler; this controller owns only the intro. */
export function createScrollIntro(requestFrame: () => void) {
  const intro = document.querySelector<HTMLElement>(".scroll-intro");
  const stage = intro?.querySelector<HTMLElement>(".intro-stage");
  const video = intro?.querySelector<HTMLVideoElement>("video");
  const hero = intro?.querySelector<HTMLElement>(".intro-hero");
  if (!intro || !stage || !video || !hero) return null;

  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const topbar = document.querySelector<HTMLElement>(".topbar");
  const mobileCta = document.querySelector<HTMLElement>(".mobile-cta");
  const skip = intro.querySelector<HTMLButtonElement>(".intro-skip");
  const pieces = Array.from(hero.querySelectorAll<HTMLElement>(".hero-copy > *"));
  let failed = false;
  let finalFrameReady = false;
  let watchdog = 0;
  let lastTarget = -1;
  let disposed = false;
  let blobRequested = false;
  let blobUrl = "";
  let travelDistance = 0;
  const download = new AbortController();
  // Last displayable frame of this 24 fps asset (duration itself is past EOF).
  const endTime = () => Math.max(0, video.duration - 1 / 24 + 0.001);

  const setInteractive = (element: HTMLElement | null, enabled: boolean) => {
    if (element) element.inert = !enabled;
  };
  const restore = () => {
    // Keep the pre-change distance: the reduced-motion media query has already
    // collapsed CSS layout by the time its JS change listener runs.
    const oldDistance = travelDistance;
    travelDistance = 0;
    const oldTop = intro.getBoundingClientRect().top + window.scrollY;
    intro.dataset.fallback = "true";
    document.documentElement.style.setProperty("--intro-nav", "1");
    document.documentElement.style.setProperty("--intro-cta", "1");
    [hero, topbar, mobileCta].forEach((el) => setInteractive(el, true));
    clearTimeout(watchdog);
    // Preserve the reader's position if a preference/error collapses the runway.
    if (window.scrollY > oldTop) {
      window.scrollTo({ top: Math.max(oldTop, window.scrollY - oldDistance), behavior: "instant" });
    }
    requestFrame();
  };
  const fail = () => { failed = true; restore(); };
  const armWatchdog = () => {
    clearTimeout(watchdog);
    // Network/decode failure fallback only; never determines film completion.
    watchdog = window.setTimeout(fail, 15000);
  };
  const measure = () => {
    intro.style.setProperty("--intro-hero-height", `${hero.offsetHeight}px`);
    if (!media.matches && !failed) travelDistance = Math.max(0, intro.offsetHeight - stage.offsetHeight);
    requestFrame();
  };
  const onPreference = () => {
    if (media.matches || failed) restore();
    else {
      delete intro.dataset.fallback;
      measure();
      if (video.readyState >= 2) onLoaded();
      requestFrame();
    }
  };
  const onLoaded = () => {
    clearTimeout(watchdog);
    // Some static hosts/local Worker previews do not implement HTTP Range.
    // A fully downloaded Blob gives the media decoder a seekable local source
    // without changing hosting settings or replacing native scrolling.
    if (!failed && !media.matches && !blobRequested && Number.isFinite(video.duration)
      && (!video.seekable.length || video.seekable.end(video.seekable.length - 1) < video.duration - 0.1)) {
      blobRequested = true;
      armWatchdog();
      fetch(video.currentSrc, { signal: download.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Intro download failed");
          return response.blob();
        })
        .then((blob) => {
          if (disposed || failed || media.matches) return;
          blobUrl = URL.createObjectURL(blob);
          video.src = blobUrl;
          video.load();
        })
        .catch(() => { if (!disposed) fail(); });
    }
    requestFrame();
  };
  const onSeeked = () => {
    clearTimeout(watchdog);
    // seeked + HAVE_CURRENT_DATA confirms the final frame has decoded. Reveal
    // then updates on the shared rAF, alongside the browser's next video paint.
    // A paused video's frame callback can be consumed by an earlier seek, so
    // do not make availability of another callback a prerequisite for revealing.
    finalFrameReady = video.readyState >= 2 && video.currentTime >= endTime() - 0.02;
    requestFrame();
  };
  const onSkip = () => {
    fail();
    const heading = hero.querySelector("h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  };

  video.addEventListener("loadedmetadata", requestFrame);
  video.addEventListener("loadeddata", onLoaded);
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("error", fail);
  video.querySelector("source")?.addEventListener("error", fail);
  skip?.addEventListener("click", onSkip);
  media.addEventListener("change", onPreference);
  window.addEventListener("pageshow", measure);
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(hero);
  measure();
  onPreference();
  if (!media.matches && video.readyState < 2) armWatchdog();
  if (video.error) fail();

  return {
    update() {
      if (failed || media.matches) return;
      const distance = Math.max(1, intro.offsetHeight - stage.offsetHeight);
      const progress = clamp01(-intro.getBoundingClientRect().top / distance);
      const timeline = introTimeline(progress, finalFrameReady);
      if (timeline.video < 1) finalFrameReady = false;

      if (Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 2) {
        const target = timeline.video * endTime();
        // Coalesce seeks: while a decode is pending, retain only the newest scroll
        // target. seeked schedules another rAF even when scrolling has stopped.
        const needsFinalFrame = timeline.video === 1 && !finalFrameReady;
        if (!video.seeking && (Math.abs(video.currentTime - target) > 1 / 48 || needsFinalFrame)) {
          if (lastTarget !== target) { lastTarget = target; armWatchdog(); }
          try { video.currentTime = target; } catch { fail(); return; }
        }
      }

      const reveal = introTimeline(progress, finalFrameReady).reveal;
      intro.style.setProperty("--intro-reveal", `${reveal}`);
      intro.style.setProperty("--intro-video-opacity", `${1 - clamp01(reveal / 0.65)}`);
      intro.style.setProperty("--intro-video-scale", `${1 + reveal * 0.025}`);
      intro.style.setProperty("--intro-video-blur", `${reveal * 2}px`);
      hero.style.opacity = `${clamp01(reveal / 0.5)}`;
      hero.style.transform = `translateY(${(1 - reveal) * 64}px) scale(${0.985 + reveal * 0.015})`;
      pieces.forEach((piece, index) => {
        const part = clamp01((reveal - 0.08 - index * 0.085) / 0.45);
        piece.style.opacity = `${part}`;
        piece.style.transform = `translateY(${(1 - part) * 24}px)`;
      });
      const nav = clamp01((reveal - 0.15) / 0.6);
      const cta = clamp01((reveal - 0.65) / 0.35);
      document.documentElement.style.setProperty("--intro-nav", `${nav}`);
      document.documentElement.style.setProperty("--intro-cta", `${cta}`);
      intro.dataset.navVisible = nav > 0 ? "true" : "false";
      intro.dataset.ctaVisible = cta > 0 ? "true" : "false";
      setInteractive(topbar, nav === 1);
      setInteractive(mobileCta, cta === 1);
      setInteractive(hero, reveal === 1);
      if (skip) { skip.hidden = reveal > 0; skip.inert = reveal > 0; }
      intro.dataset.complete = reveal === 1 ? "true" : "false";
    },
    destroy() {
      disposed = true;
      download.abort();
      clearTimeout(watchdog);
      resizeObserver.disconnect();
      video.removeEventListener("loadedmetadata", requestFrame);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", fail);
      video.querySelector("source")?.removeEventListener("error", fail);
      skip?.removeEventListener("click", onSkip);
      media.removeEventListener("change", onPreference);
      window.removeEventListener("pageshow", measure);
      [hero, topbar, mobileCta].forEach((el) => setInteractive(el, true));
      if (blobUrl) {
        video.removeAttribute("src");
        URL.revokeObjectURL(blobUrl);
        video.load();
      }
    },
  };
}
