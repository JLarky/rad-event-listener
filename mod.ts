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

export function rad<
  MyElement extends { addEventListener?: any; removeEventListener?: any }
>(
  element: MyElement,
  gen: (rad: MyElement["addEventListener"]) => void
): () => void {
  let cleanup: undefined | (() => void);
  gen((listener: any, options: any) => {
    element.addEventListener(listener, options);
    cleanup = () => element.removeEventListener(listener, options);
  });
  if (!cleanup) {
    throw new Error("you forgot to add event listener");
  }
  return cleanup;
}
