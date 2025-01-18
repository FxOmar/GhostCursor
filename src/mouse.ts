export class Mouse {
  private reactions = new Map();

  private reactiveCoordinate = new Proxy(
    { x: 0, y: 0 },
    {
      set: (target, prop: string | symbol, value, receiver) => {
        let oldValue = target[prop as keyof typeof target];

        Reflect.set(target, prop, value, receiver);

        if (oldValue !== value) {
          let reactionsForProp = this.reactions.get(prop);

          if (reactionsForProp) {
            reactionsForProp.forEach((reaction: () => void) => reaction());
          }
        }

        return true;
      },
    }
  );

  constructor() {
    document.addEventListener('mousemove', (event) => {
      this.reactiveCoordinate.x = event.clientX;
      this.reactiveCoordinate.y = event.clientY;
    });
  }

  observeMouse(callback: (position: { x: number; y: number }) => void) {
    const watch = (prop: string) => {
      let reactionsForProp = this.reactions.get(prop);

      if (!reactionsForProp) {
        reactionsForProp = new Set();
        this.reactions.set(prop, reactionsForProp);
      }

      reactionsForProp.add(() => callback(this.reactiveCoordinate));
    };

    ['x', 'y'].forEach(watch);
  }
}
