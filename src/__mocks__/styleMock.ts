const styleMock: Record<string, string> = new Proxy(
  {},
  {
    get(_target, name) {
      if (typeof name === 'string') {
        return name;
      }
      return undefined;
    },
  }
);
export default styleMock;