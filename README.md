# tailwind-variation

Tailwind's utility meets a top-tier variant API for maximum flexibility and customization.

### Features

## Installation

You can install the package using **npm**, **yarn**, or **pnpm**.

```bash
pnpm add tailwind-variation

yarn install tailwind-variation

npm install tailwind-variation
```

## Usage

```typescript
import { createVariation } from "tailwind-variation";

// Example usage of the createVariants function
const buttonVariants = createVariation({
  base: "px-4 py-2 font-bold transition-all", // Base styles
  variants: {
    color: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-black",
    },
    size: {
      sm: "text-sm",
      lg: "text-lg",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: {
    color: "primary", // Default to primary color
    size: "sm", // Default to small size
  },
});

// Example usage
const buttonClass = buttonVariants({
  color: "secondary",
  size: "lg",
  fullWidth: true,
});

console.log(buttonClass); // Outputs: 'px-4 py-2 font-bold transition-all bg-gray-500 text-black text-lg w-full'
```

## tsup

Bundle your TypeScript library with no config, powered by esbuild.

https://tsup.egoist.dev/

## How to use this

1. install dependencies

```
# pnpm
$ pnpm install

# yarn
$ yarn install

# npm
$ npm install
```

2. Add your code to `src`
3. Add export statement to `src/index.ts`
4. Test build command to build `src`.
   Once the command works properly, you will see `dist` folder.

```zsh
# pnpm
$ pnpm run build

# yarn
$ yarn run build

# npm
$ npm run build
```

5. Publish your package

```zsh
$ npm publish
```

## test package

https://www.npmjs.com/package/tailwind-variation
