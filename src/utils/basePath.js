/** Router basename from Vite `base` (root `/` on admin.mejoric.com / admin-dev.mejoric.com). */
export function getRouterBasename() {
  const base = import.meta.env.BASE_URL || "/";
  if (!base || base === "/") return undefined;
  return base.replace(/\/$/, "");
}

/** Build a path under the Vite base, e.g. `/login`. */
export function appPath(path = "/") {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  if (!normalized) {
    return base.endsWith("/") ? base : `${base}/`;
  }
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${normalized}`.replace(/([^:])\/{2,}/g, "$1/");
}
