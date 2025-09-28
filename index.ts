import mimicFunction from "./mimic-function";

export type Options = {
  /**
	Throw an error when called more than once.

	@default false
	*/
  readonly throw?: boolean;
};

const calledFunctions = new WeakMap<Function, number>();

/**
Ensure a function is only called once. When called multiple times it will return the return value from the first call.

@param fn - The function that should only be called once.
@returns A function that only calls `fn` once.

@example
```
import onetime from 'onetime';

let index = 0;

const foo = onetime(() => ++index);

foo(); //=> 1
foo(); //=> 1
foo(); //=> 1

onetime.callCount(foo); //=> 3
```
*/
const onetime = <ArgumentsType extends unknown[], ReturnType>(
  function_: (...arguments_: ArgumentsType) => ReturnType,
  options: Options = {},
): ((...arguments_: ArgumentsType) => ReturnType) => {
  if (typeof function_ !== "function") {
    throw new TypeError("Expected a function");
  }

  let returnValue: ReturnType;
  let callCount = 0;
  const functionName =
    (function_ as any).displayName || function_.name || "<anonymous>";

  const onetimeWrapper = function (
    this: any,
    ...arguments_: ArgumentsType
  ): ReturnType {
    calledFunctions.set(onetimeWrapper, ++callCount);

    if (callCount === 1) {
      returnValue = function_.apply(this, arguments_);
      // Clear reference to original function to help GC
      function_ = undefined as any;
    } else if (options.throw === true) {
      throw new Error(`Function \`${functionName}\` can only be called once`);
    }

    return returnValue;
  };

  mimicFunction(onetimeWrapper, function_);
  calledFunctions.set(onetimeWrapper, callCount);

  return onetimeWrapper;
};

/**
Get the number of times `fn` has been called.

@param fn - The function to get call count from.
@returns A number representing how many times `fn` has been called.

@example
```
import onetime from 'onetime';

const foo = onetime(() => {});
foo();
foo();
foo();

console.log(onetime.callCount(foo));
//=> 3
```
*/
onetime.callCount = (function_: (...arguments_: any[]) => unknown): number => {
  if (!calledFunctions.has(function_)) {
    throw new Error(
      `The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`,
    );
  }

  return calledFunctions.get(function_)!;
};

export default onetime;
