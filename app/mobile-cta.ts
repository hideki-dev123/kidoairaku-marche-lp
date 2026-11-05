export function shouldShowMobileCta(heroBottom: number, entryTop: number, viewportHeight: number): boolean {
  return heroBottom <= 0 && entryTop > viewportHeight - 100;
}

