# onetime

> Ensure a function is only called once

When called multiple times it will return the return value from the first call.

*Unlike the module [once](https://github.com/isaacs/once), this one isn't naughty and extending `Function.prototype`.*

This package is a lightweight fork of `sindresorhus/onetime` that preserves the original behavior and keeps the public API fully compatible, while additionally providing:

- **CommonJS support out of the box**
- **Native TypeScript typings (no separate install)**
- **Zero runtime dependencies**

## Install

```sh
# pnpm (recommended)
pnpm add @reedchan/onetime

# npm
npm install @reedchan/onetime

# yarn
yarn add @reedchan/onetime
```

## Features

- 🚀  100% API-compatible with the original `onetime` package
- ⭐  Supports both ESM and CommonJS consumers
- 🔥  Native TypeScript support via included `types` field
- 🎉  Zero runtime dependencies

## Usage

```typescript
import onetime from '@reedchan/onetime';

let index = 0;

const foo = onetime(() => ++index);

foo(); //=> 1
foo(); //=> 1
foo(); //=> 1

onetime.callCount(foo); //=> 3
```

```typescript
import onetime from '@reedchan/onetime';

const foo = onetime(() => {}, {throw: true});

foo();

foo();
//=> Error: Function `foo` can only be called once
```

## API

### onetime(fn, options?)

Returns a function that only calls `fn` once.

#### fn

Type: `Function`

The function that should only be called once.

#### options

Type: `object`

##### throw

Type: `boolean`\
Default: `false`

Throw an error when called more than once.

### onetime.callCount(fn)

Returns a number representing how many times `fn` has been called.

Note: It throws an error if you pass in a function that is not wrapped by `onetime`.

```js
import onetime from '@reedchan/onetime';

const foo = onetime(() => {});

foo();
foo();
foo();

console.log(onetime.callCount(foo));
//=> 3
```

#### fn

Type: `Function`

The function to get call count from.
