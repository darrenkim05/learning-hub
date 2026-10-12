// Stand-in for "rolldown" inside the server bundle only (see astro.config.mjs). Never called at runtime.
export function rolldown() { throw new Error("rolldown is not available at runtime"); }
