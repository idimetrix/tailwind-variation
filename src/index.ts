import { twMerge as twMergeBase, extendTailwindMerge } from "tailwind-merge";

// Helper utilities (these should be implemented in a utils file in a real-world scenario)
export const isEqual = (a: any, b: any) =>
  JSON.stringify(a) === JSON.stringify(b);
export const isEmptyObject = (obj: any) =>
  !obj || Object.keys(obj).length === 0;
export const falsyToString = (value: any) =>
  value == null || value === false ? "false" : String(value);
export const mergeObjects = (obj1: any, obj2: any) => ({ ...obj1, ...obj2 });
export const removeExtraSpaces = (str: string) =>
  str.replace(/\s+/g, " ").trim();
export const flatMergeArrays = (arr1: any[], arr2: any[]) => [...arr1, ...arr2];
export const flatArray = (arr: any[]) =>
  arr.reduce((flat, next) => flat.concat(next), []);

// Utility types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type CompoundVariantOptions = Record<string, string | string[]>;

interface Config {
  twMerge: boolean;
  twMergeConfig: Record<string, any>;
  responsiveVariants: boolean | string[];
}

interface TVOptions {
  base?: string;
  extend?: TVOptions;
  slots?: Record<string, string>;
  variants?: Record<string, Record<string, string>>;
  compoundVariants?: CompoundVariantOptions[];
  compoundSlots?: CompoundSlot[];
  defaultVariants?: Record<string, string>;
}

interface CompoundSlot {
  slots: string[];
  class?: string;
  className?: string;
  [key: string]: any;
}

// Default config for TV
export const defaultConfig: Config = {
  twMerge: true,
  twMergeConfig: {},
  responsiveVariants: false,
};

// Utility function to return `undefined` if value is falsy
export const voidEmpty = <T>(value: T | null | undefined): T | undefined =>
  !!value ? value : undefined;

// Core className utility with type safety
export const cnBase = (...classes: (string | false | null | undefined)[]) =>
  voidEmpty(flatArray(classes).filter(Boolean).join(" "));

// Memoized twMerge with configuration support
let cachedTwMerge: typeof twMergeBase | null = null;
let cachedTwMergeConfig: Record<string, any> = {};
let didTwMergeConfigChange = false;

const cn =
  (...classes: (string | false | null | undefined)[]) =>
  (config: Config) => {
    if (!config.twMerge) {
      return cnBase(...classes);
    }

    // Rebuild twMerge cache if the config changes
    if (!cachedTwMerge || didTwMergeConfigChange) {
      didTwMergeConfigChange = false;
      cachedTwMerge = isEmptyObject(cachedTwMergeConfig)
        ? twMergeBase
        : extendTailwindMerge({
            ...cachedTwMergeConfig,
            extend: {
              theme: cachedTwMergeConfig.theme,
              classGroups: cachedTwMergeConfig.classGroups,
              conflictingClassGroupModifiers:
                cachedTwMergeConfig.conflictingClassGroupModifiers,
              conflictingClassGroups:
                cachedTwMergeConfig.conflictingClassGroups,
              ...cachedTwMergeConfig.extend,
            },
          });
    }

    return voidEmpty(cachedTwMerge(cnBase(...classes)));
  };

// Join two objects and concatenate the class names if they share a key
export const joinObjects = <T extends Record<string, any>>(
  obj1: T,
  obj2: T,
): T => {
  const result: T = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      result[key] = cnBase(result[key], obj2[key]);
    }
  }

  return result;
};

// Main function to create TV component
export const createVariation = (
  options: TVOptions,
  configProp?: DeepPartial<Config>,
) => {
  const {
    extend = null,
    slots: slotProps = {},
    variants: variantsProps = {},
    compoundVariants: compoundVariantsProps = [],
    compoundSlots = [],
    defaultVariants: defaultVariantsProps = {},
  } = options;

  const config: Config = { ...defaultConfig, ...configProp } as Config;

  const base = extend?.base
    ? cnBase(extend.base, options?.base)
    : options?.base;
  const variants =
    extend?.variants && !isEmptyObject(extend.variants)
      ? mergeObjects(variantsProps, extend.variants)
      : variantsProps;
  const defaultVariants =
    extend?.defaultVariants && !isEmptyObject(extend.defaultVariants)
      ? { ...extend.defaultVariants, ...defaultVariantsProps }
      : defaultVariantsProps;

  // Cache the twMerge configuration if it changes
  if (
    !isEmptyObject(config.twMergeConfig) &&
    !isEqual(config.twMergeConfig, cachedTwMergeConfig)
  ) {
    didTwMergeConfigChange = true;
    cachedTwMergeConfig = config.twMergeConfig;
  }

  const isExtendedSlotsEmpty = isEmptyObject(extend?.slots);
  const componentSlots = !isEmptyObject(slotProps)
    ? {
        base: cnBase(options?.base, isExtendedSlotsEmpty && extend?.base),
        ...slotProps,
      }
    : {};

  const slots = isExtendedSlotsEmpty
    ? componentSlots
    : joinObjects(
        { ...extend?.slots },
        isEmptyObject(componentSlots)
          ? { base: options?.base }
          : componentSlots,
      );

  const compoundVariants = isEmptyObject(extend?.compoundVariants)
    ? compoundVariantsProps
    : flatMergeArrays(extend?.compoundVariants || [], compoundVariantsProps);

  const component = (props: Record<string, any>) => {
    if (
      isEmptyObject(variants) &&
      isEmptyObject(slotProps) &&
      isExtendedSlotsEmpty
    ) {
      return cn(base, props?.class, props?.className)(config);
    }

    const getVariantValue = (
      variant: string,
      vrs = variants,
      slotKey: string | null = null,
    ) => {
      const variantObj = vrs?.[variant];
      const variantProp = props?.[variant] ?? defaultVariants?.[variant];

      if (!variantObj || !variantProp) {
        return null;
      }

      const variantKey = falsyToString(variantProp);
      return variantObj[variantKey] || null;
    };

    const getVariantClassNames = () =>
      Object.keys(variants)
        .map((vk) => getVariantValue(vk))
        .filter(Boolean);

    return cn(
      base,
      getVariantClassNames() as any,
      props?.class,
      props?.className,
    )(config);
  };

  component.variantKeys = () => (variants ? Object.keys(variants) : []);
  component.extend = extend;
  component.base = base;
  component.slots = slots;
  component.variants = variants;
  component.defaultVariants = defaultVariants;
  component.compoundSlots = compoundSlots;
  component.compoundVariants = compoundVariants;

  return component;
};

// Factory function to create TV components with a specific configuration
export const createTV = (configProp: DeepPartial<Config>) => {
  return (options: TVOptions, config?: DeepPartial<Config>) =>
    createVariation(
      options,
      config ? mergeObjects(configProp, config) : configProp,
    );
};
