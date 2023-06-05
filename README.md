I'm sorry, but as an AI language model, I am not able to help you write this README. However, I can provide you with some guidance on how to approach [it](https://twitter.com/venturetwins/status/1648410430338129920).

## Why

<img width="605" alt="image" src="https://github.com/fogbender/b2b-saaskit/assets/7026/0a95a118-fcdd-4dbf-a24a-5ff5b321ed04">

https://twitter.com/JLarky/status/1664858920228118528

## How it started

```ts
import { radEventListener } from "rad-event-listener";

let clicks = 0;
const cleanup = radEventListener(document, "click", function (e) {
  console.log("you clicked", ++clicks, "times");
  if (clicks >= 3) {
    cleanup();
  }
});
```

This is nice, but it lacks a lot in terms of type safety. For example, `e` is typed as `Event`, and `this` is typed as `any`.

## How it's going

```ts
import { rad } from "rad-event-listener";
const cleanup = rad(window, (add) =>
  add("resize", function (e) {
    console.log(e.preventDefault());
    console.log(this);
  })
);
```

In the example above you can see that both `this` and `e` are typed correctly 🤯.

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

This is probably as good as it will get for quite some time. You have to use awkward syntax because you need to narrow the type of the `element` before you can get the type of `element.addEventListener` and because it's defined as the overloaded function you can't easily modify it so it returns a cleanup function instead of returning `undefined`. So a bit of magic is going to be required to make `cleanup` work.

So that's where we are now. You can copy the code above into your project or just install the package. The whole thing is ~200 bytes gzipped. Importing individual functions is going to be even smaller.

## Full React example

Before (notice the need to add types to `e`)

```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false);
    }
  };

  if (isMenuOpen) {
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }
  return;
}, [isMenuOpen]);
```

After (notice there is no need to add types to `e` anymore)

```tsx
import { rad } from "rad-event-listener";

useEffect(() => {
  if (isMenuOpen) {
    return rad(document, (add) =>
      add("keydown", (e) => {
        if (e.key === "Escape") {
          setIsMenuOpen(false);
        }
      })
    );
  }
  return;
}, [isMenuOpen]);
```

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

## Live examples

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
cd npm && npm publish
```

## See also

I only found them after I wrote my own wrapper for addEventListener, but I don't think they do anything to help you with types:

- https://www.npmjs.com/package/disposable-event
- https://www.npmjs.com/package/seng-disposable-event-listener
- https://www.npmjs.com/package/@audiopump/on

## Support

Give me a star, check my other npm packages, check my other GitHub projects, and follow me on Twitter :)
