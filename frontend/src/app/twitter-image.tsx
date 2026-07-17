// Next.js requires `runtime` to be a string literal in this file — a re-export
// isn't statically analyzable, so declare it directly.
export const runtime = "edge";
export { default, alt, size, contentType } from "./opengraph-image";
