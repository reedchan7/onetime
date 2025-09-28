export interface MimicOptions {
  ignoreNonConfigurable?: boolean;
}

const copyProperty = (
  to: Function,
  from: Function,
  property: string | symbol,
  ignoreNonConfigurable: boolean,
): void => {
  // `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
  // `Function#prototype` is non-writable and non-configurable so can never be modified.
  if (property === "length" || property === "prototype") {
    return;
  }

  // `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
  if (property === "arguments" || property === "caller") {
    return;
  }

  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }

  if (fromDescriptor) {
    Object.defineProperty(to, property, fromDescriptor);
  }
};

// `Object.defineProperty()` throws if the property exists, is not configurable and either:
// - one its descriptors is changed
// - it is non-writable and its value is changed
const canCopyProperty = (
  toDescriptor: PropertyDescriptor | undefined,
  fromDescriptor: PropertyDescriptor | undefined,
): boolean => {
  return (
    toDescriptor === undefined ||
    toDescriptor.configurable ||
    (toDescriptor.writable === fromDescriptor?.writable &&
      toDescriptor.enumerable === fromDescriptor?.enumerable &&
      toDescriptor.configurable === fromDescriptor?.configurable &&
      (toDescriptor.writable || toDescriptor.value === fromDescriptor?.value))
  );
};

const changePrototype = (to: Function, from: Function): void => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }

  Object.setPrototypeOf(to, fromPrototype);
};

const wrappedToString = (withName: string, fromBody: string): string =>
  `/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(
  Function.prototype,
  "toString",
);
const toStringName = Object.getOwnPropertyDescriptor(
  Function.prototype.toString,
  "name",
);

// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to: Function, from: Function, name: string): void => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());

  // Ensure `to.toString.toString` is non-enumerable and has the same `name`
  if (toStringName) {
    Object.defineProperty(newToString, "name", toStringName);
  }

  if (toStringDescriptor) {
    const {
      writable = false,
      enumerable = false,
      configurable = false,
    } = toStringDescriptor; // We destructure to avoid a potential `get` descriptor.
    Object.defineProperty(to, "toString", {
      value: newToString,
      writable,
      enumerable,
      configurable,
    });
  }
};

/**
 * Make a function mimic another one
 * @param to - Function to change
 * @param from - Function to copy properties from
 * @param options - Options for mimicking
 * @returns The modified `to` function
 */
function mimicFunction<T extends Function>(
  to: T,
  from: Function,
  options: MimicOptions = {},
): T {
  const { ignoreNonConfigurable = false } = options;
  const { name } = to;

  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }

  changePrototype(to, from);
  changeToString(to, from, name);

  return to;
}

export default mimicFunction;
