import { createVariation } from ".";

(async () => {
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
})();
