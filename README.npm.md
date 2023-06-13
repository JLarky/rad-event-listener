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

In the examples above you can see that both `this` and `e` are typed correctly 🤯.

Full README: https://github.com/JLarky/rad-event-listener
