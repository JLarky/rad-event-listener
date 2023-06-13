## Rad Event Listener

[![minzip size](https://deno.bundlejs.com/?q=rad-event-listener&treeshake=[{on}]&badge=)](https://bundlejs.com/?q=rad-event-listener&treeshake=%5B%7B+on+%7D%5D)
[![install size](https://badgen.deno.dev/packagephobia/install/rad-event-listener)](https://packagephobia.com/result?p=rad-event-listener)
[![dependency count](https://badgen.deno.dev/bundlephobia/dependency-count/rad-event-listener)](https://bundlephobia.com/result?p=rad-event-listener)

Please see the full README at https://github.com/JLarky/rad-event-listener

Before:

```ts
const handler = (e: MouseEvent) => {
  console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
};

document.addEventListener("keydown", handleEscape);

const cleanup = () => {
  document.removeEventListener("keydown", handleEscape);
};
```

After:

```ts
import { on, rad, radEventListener } from "rad-event-listener";

// on is alias of radEventListener
const cleanup = on(document, "mousemove", function (e) {
  console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
});
```

In the examples above you can see that both `this` and `e` are typed correctly 🤯. In the first example we had to manually type `e` and `this` was `any`.
