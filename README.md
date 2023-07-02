## Rad Event Listener

[![minzip size](https://deno.bundlejs.com/?q=rad-event-listener&treeshake=[{on}]&badge=)](https://bundlejs.com/?q=rad-event-listener&treeshake=%5B%7B+on+%7D%5D)
[![install size](https://badgen.deno.dev/packagephobia/install/rad-event-listener)](https://packagephobia.com/result?p=rad-event-listener)
[![dependency count](https://badgen.deno.dev/bundlephobia/dependency-count/rad-event-listener)](https://bundlephobia.com/result?p=rad-event-listener)

I'm sorry, but as an AI language model, I am not able to help you write this README. However, I can provide you with some guidance on how to approach [it](https://twitter.com/venturetwins/status/1648410430338129920).

## Why

<img width="605" alt="image" src="https://github.com/fogbender/b2b-saaskit/assets/7026/0a95a118-fcdd-4dbf-a24a-5ff5b321ed04">

https://twitter.com/JLarky/status/1664858920228118528

## What you get from this package (React example)

```tsx
import { radEventListener } from "rad-event-listener";

useEffect(() => {
  if (isMenuOpen) {
    return radEventListener(document, "keydown", (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    });
  }
  return;
}, [isMenuOpen]);
```

Notice that `e` is correctly typed as `KeyboardEvent` so we can use `e.key` without any issues. `radEventListener` returns a cleanup function that is going to be called on cleanup. So just to clarify what is actually happening:

```tsx
import { radEventListener } from "rad-event-listener";

useEffect(() => {
  if (isMenuOpen) {
    const cleanup = radEventListener(document, "keydown", (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    });
    return () => cleanup();
  }
  return;
}, [isMenuOpen]);
```

## What you have to do if you are not using this package

```tsx
useEffect(() => {
  if (isMenuOpen) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }
  return;
}, [isMenuOpen]);
```

Notice that you had to specify the type of `e` as `KeyboardEvent` and you had to create a separate function and pass it to both `addEventListener` and `removeEventListener`.

## API reference

```ts
import { on, rad, radEventListener } from "rad-event-listener";

const cleanup = radEventListener(document, "mousemove", function (e) {
  console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
});

// on is alias of radEventListener
const cleanup2 = on(document, "mousemove", function (e) {
  console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
});

// rad is using a different way to get type of arguments
const cleanup3 = rad(document, (add) =>
  add("mousemove", function (e) {
    console.log("mouse moved to", e.x, e.y, this === e.currentTarget);
  })
);
```

In the examples above you can see that both `this` and `e` are typed correctly 🤯. More on `rad` in the next section.

## More on why

I always find myself starting with something like `document.addEventListener('click', (e) => console.log(e.button))` and nowadays typescript types for it are pretty good! I have autocomplete for `"click"`, I didn't have to specify that `e` is `MouseEvent` and I can safely use `e.button`. All good, right?

Wrong, turns out that I forgot to remove the event listener and now I have a memory leak or a bug. Just add `document.removeEventListener('click', (e) => console.log(e.button))` and I'm done, right?

Wrong, you need to preserve the reference to the same function you passed to `addEventListener` and pass it to `removeEventListener`, the code above creates a new function. So just extract the function to a variable and pass it to both `addEventListener` and `removeEventListener`, right?

Yes, but also no. Say you have this code:

```ts
const handler = (e) => console.log(e.button);
document.addEventListener("click", handler);
const cleanup = document.removeEventListener("click", handler);
```

You will get a typescript error because `e` has type `any` and you can't use `e.button`. Now you need to spend time trying to guess what type `addEventListener('click')` uses again?

Okay, I can just create a helper function that automates this for me, right?

```ts
const radEventListener = (target, type, handler) => {
  target.addEventListener(type, handler);
  return () => target.removeEventListener(type, handler);
};
const cleanup = radEventListener(document, "click", (e) =>
  console.log(e.button)
);
```

Yes, but also hell no. How are you going to type that function? This is probably where you will end up after a few days of trying:

```ts
function radEventListener<
  MyElement extends { addEventListener?: any; removeEventListener?: any }
>(
  element: MyElement,
  ...args: Parameters<MyElement["addEventListener"]>
): () => void {
  element.addEventListener(...args);
  return () => {
    element.removeEventListener(...args);
  };
}
```

Unfortunately, if you look closely your `type` is `string` and your `handler` is `(e: Event) => void` which is not bad, but also not great. Do you know that each target has its type for `addEventListener` with its list of events and types for `handler`? And that type uses overloads because it needs to handle the case when the type is just a string. Long story short, after a week of wrangling with typescript types you will create something like this:

```ts
export function rad<
  MyElement extends { addEventListener?: any; removeEventListener?: any }
>(
  element: MyElement,
  gen: (rad: MyElement["addEventListener"]) => void
): () => void {
  let cleanup: undefined | (() => void);
  gen((...args: any[]) => {
    element.addEventListener(...args);
    cleanup = () => element.removeEventListener(...args);
  });
  if (!cleanup) {
    throw new Error("you forgot to add event listener");
  }
  return cleanup;
}
```

This is as good as I could get by myself. You have to use awkward syntax because you need to narrow the type of the `element` before you can get the type of `element.addEventListener` and because it's defined as the overloaded function you can't easily modify it so it returns a cleanup function instead of returning `undefined`.

So I asked literal [TypeScript Wizards](https://www.mattpocock.com/discord) for help and turns out that instead of trying to extract the type of `addEventListener` you can instead use types from `on${event}` property. So for example, instead of trying to find the type of `handler` in `document.addEventListener("resize", handler)`, we find the type of argument of `document.onresize` which is `UIEvent`, and cast `handler` to `(event: UIEvent) => void`.

That will give us this monstrosity (well we know that it's going to be compiled to 100 bytes minified, but still):

```ts
export function radEventListener<
  MyElement extends { addEventListener: any; removeEventListener: any },
  // get the possible events by using the `MyElement.on${someEvent}` properties
  Event extends {
    [K in keyof MyElement]-?: K extends `on${infer E}` ? E : never;
  }[keyof MyElement]
>(
  element: MyElement,
  // recreate the args for addEventListener
  ...args: [
    type: Event,
    // grab the correct types off the function
    listener: MyElement extends Record<
      `on${Event}`,
      null | ((...args: infer Args) => infer Return)
    >
      ? // overwrite the type of this to make sure that it is always `MyElement`
        (this: MyElement, ...args: Args) => Return
      : never,
    options?: boolean | AddEventListenerOptions
  ]
): () => void {
  element.addEventListener(...args);
  return () => {
    element.removeEventListener(...args);
  };
}
```

So that's where we are now. You can copy the code above into your project or just install the package. The whole thing is 184 bytes gzipped. Importing individual functions is going to be even smaller (`on` 101 bytes, `radEventListener` 105 bytes,  `rad` 146 bytes).

## Another sane type-safe alternative

```tsx
useEffect(() => {
  if (isMenuOpen) {
    const abort = new AbortController();
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          setIsMenuOpen((x) => !x);
        }
      },
      { signal: abort.signal }
    );
    return () => abort.abort();
  }
  return;
}, [isMenuOpen]);
```

`options.signal` parameter is [well supported](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#browser_compatibility) by all modern browsers. Also sometimes it's enough to use the `once` parameter.

## For completeness' sake, the approach using `handleEvent` (you have to add types to `handler` manually):

```tsx
useEffect(() => {
  if (isMenuOpen) {
    const handler = {
      handleEvent: function (e: KeyboardEvent) {
        if (e.key === "Escape") {
          setIsMenuOpen((x) => !x);
        }
      },
      addEventListener: function () {
        document.addEventListener("keydown", this);
        return () => document.removeEventListener("keydown", this);
      },
    };
    return handler.addEventListener();
  }
  return;
}, [isMenuOpen]);
```

## Live examples using on

- [SolidJS ](https://stackblitz.com/edit/solidjs-templates-zqosap?file=src%2FApp.tsx)
- [React](https://stackblitz.com/edit/stackblitz-starters-makbbf?file=src%2FApp.tsx)
- [Astro](https://stackblitz.com/edit/withastro-astro-wy83fc?file=src%2Fpages%2F_script.ts)

## Live examples using rad

- [SolidJS ](https://stackblitz.com/edit/solidjs-templates-pzxnlg?file=src%2FApp.tsx)
- [React](https://stackblitz.com/edit/stackblitz-starters-rbk3jb?file=src%2FApp.tsx)
- [Astro](https://stackblitz.com/edit/withastro-astro-9svrcx?file=src%2Fpages%2F_script.ts)

## Development

Here's everything I know how to use deno to release this package:

```bash
deno task dev
deno bench
deno test
./_build_npm.ts 0.0.1
(cd npm && npm publish)
```

## See also

I only found them after I wrote my own wrapper for addEventListener, but I don't think they do anything to help you with types:

- https://www.npmjs.com/package/disposable-event
- https://www.npmjs.com/package/seng-disposable-event-listener
- https://www.npmjs.com/package/@audiopump/on

## Thanks

- @ggrandi who wrote types for `radEventListener` https://github.com/JLarky/rad-event-listener/commit/cef9577a9130a8681866289f1bae2a1f0b549ece

## Support

Give me a star, check my other npm packages, check my other GitHub projects, and follow me on Twitter :)
