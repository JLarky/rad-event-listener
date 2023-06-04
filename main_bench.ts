import { radEventListener, rad } from "./mod.ts";

Deno.bench(function radEventListenerWindow() {
  const cleanup = radEventListener(window, "load", () => {});
  cleanup();
});

Deno.bench(function radWindow() {
  const cleanup = rad(window)((add) => add("load", () => {}));
  cleanup();
});
