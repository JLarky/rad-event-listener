import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.190.0/testing/mock.ts";
import { radEventListener, rad } from "./mod.ts";

Deno.test(function radEventListenerTest() {
  const addEventListener = spy((type: "load", cb: () => void) => {});
  const removeEventListener = spy((type: "load", cb: () => void) => {});
  const onEvent = spy();
  // setup
  const cleanup = radEventListener(
    { addEventListener, removeEventListener, onload: () => {} },
    "load",
    onEvent
  );
  assertSpyCalls(addEventListener, 1);
  assertSpyCalls(removeEventListener, 0);
  assertSpyCall(addEventListener, 0, {
    args: ["load", onEvent],
    returned: undefined,
  });
  // cleanup
  assertEquals(cleanup(), undefined);
  assertSpyCalls(addEventListener, 1);
  assertSpyCalls(removeEventListener, 1);
  assertSpyCall(removeEventListener, 0, {
    args: ["load", onEvent],
    returned: undefined,
  });
});

Deno.test(function radTest() {
  const addEventListener = spy((type: "load", cb: () => void) => {});
  const removeEventListener = spy((type: "load", cb: () => void) => {});
  const onEvent = spy();
  // setup
  const cleanup = rad({ addEventListener, removeEventListener }, (add) =>
    add("load", onEvent)
  );
  assertSpyCalls(addEventListener, 1);
  assertSpyCalls(removeEventListener, 0);
  assertSpyCall(addEventListener, 0, {
    args: ["load", onEvent],
    returned: undefined,
  });
  // cleanup
  assertEquals(cleanup(), undefined);
  assertSpyCalls(addEventListener, 1);
  assertSpyCalls(removeEventListener, 1);
  assertSpyCall(removeEventListener, 0, {
    args: ["load", onEvent],
    returned: undefined,
  });
});

Deno.test(function radShouldFailTest() {
  const addEventListener = spy((type: "load", cb: () => void) => {});
  const removeEventListener = spy((type: "load", cb: () => void) => {});
  // setup
  assertThrows(
    () => rad({ addEventListener, removeEventListener }, () => {}),
    Error,
    "you forgot to add event listener"
  );
  assertSpyCalls(addEventListener, 0);
});
