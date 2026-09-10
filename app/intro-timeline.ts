export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** All phases are reversible and driven by distance, never elapsed time. */
export function introTimeline(progress: number, finalFrameReady: boolean) {
  const p = clamp01(progress);
  return {
    video: clamp01(p / 0.78),
    reveal: finalFrameReady ? clamp01((p - 0.82) / 0.18) : 0,
  };
}
