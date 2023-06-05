import { radEventListener, rad } from "./mod.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  window.addEventListener("load", () => console.log("loaded1"));
  rad(window, (rad) => {
    console.log("rad", rad);
    rad("load", function () {
      this;
      // ^?
    });
  });
  const onResize = () => {};
  const onCleanup = (cb: () => void) => {};
  // window.addEventListener("resize", onResize);
  // onCleanup(() => window.removeEventListener("resize", onResize));
  // import { rad, radEventListener } from "rad-event-listener";
  onCleanup(rad(window, (add) => add("resize", onResize)));
  onCleanup(radEventListener(window, "resize", onResize));
  const test = radEventListener(window, "load", function (e) {
    // console.log("loaded", this, e.type);
  });
  try {
    onCleanup(rad(window, (add) => {}));
  } catch (e) {
    console.error(e);
  }
}
