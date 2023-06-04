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
const cleanup = rad(window)((add) =>
  add("resize", function (e) {
    console.log(e.preventDefault());
    console.log(this);
  })
);
```

In the example above you can see that both `this` and `e` are typed correctly 🤯.

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

I only found them after I wrote this, but I don't think they do anything to help you with types:

- https://www.npmjs.com/package/disposable-event
- https://www.npmjs.com/package/seng-disposable-event-listener
- https://www.npmjs.com/package/@audiopump/on
