## Rad Event Listener

[![minzip size](https://deno.bundlejs.com/?q=rad-event-listener&treeshake=[{on}]&badge=)](https://bundlejs.com/?q=rad-event-listener&treeshake=%5B%7B+on+%7D%5D)
[![install size](https://badgen.deno.dev/packagephobia/install/rad-event-listener)](https://packagephobia.com/result?p=rad-event-listener)
[![dependency count](https://badgen.deno.dev/bundlephobia/dependency-count/rad-event-listener)](https://bundlephobia.com/result?p=rad-event-listener)

Please see the full README at https://github.com/JLarky/rad-event-listener

Before:

```ts
function handler(this: Document, e: MouseEvent) {
  console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
};

document.addEventListener("mousemove", handler);

const cleanup = () => {
  document.removeEventListener("mousemove", handler);
};
```

After:

```ts
import { on, rad, radEventListener } from "rad-event-listener";

const cleanup = radEventListener(document, "mousemove", function (e) {
  console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
});
```

Both of examples are written in a type-safe manner that will not allow you to make mistakes. But one of them made you work much more to get types of `this` and `e` right as well as made you do more work to remove the listener.

## Live examples

- [SolidJS ](https://stackblitz.com/edit/solidjs-templates-zqosap?file=src%2FApp.tsx)
- [React](https://stackblitz.com/edit/stackblitz-starters-makbbf?file=src%2FApp.tsx)
- [Astro](https://stackblitz.com/edit/withastro-astro-wy83fc?file=src%2Fpages%2F_script.ts)
