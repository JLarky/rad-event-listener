import { radEventListener, rad } from "./mod.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  window.addEventListener("load", () => console.log("loaded1"));
  const x = rad(window);
  type X = Parameters<typeof x>[0];
  //   ^?
  rad(window)((rad) => {
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
  onCleanup(rad(window)((add) => add("resize", onResize)));
  onCleanup(radEventListener(window, "resize", onResize));
  const test = radEventListener(window, "load", function (e) {
    // console.log("loaded", this, e.type);
  });
  onCleanup(rad(window)((add) => {}));
  console.log("random 1", test.random);
  console.log("random 2", test.random);
  console.log("fetch 1", await test.fetch);
  console.log("fetch 2", await test.fetch);
}
