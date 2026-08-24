export function getOgAssets(origin: string) {
  return {
    logoSrc: new URL("/agentui-mark-v2.png", origin).toString(),
    backgroundSrc: new URL("/og/dither-wave.png", origin).toString(),
  };
}
