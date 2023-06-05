export function radEventListener<
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
