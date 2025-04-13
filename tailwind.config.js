/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Background colors
    "bg-blue-600",
    "bg-blue-700",
    "bg-blue-50",
    "bg-green-50",
    "bg-gray-50",
    "bg-gray-100",
    "bg-gray-200",
    "bg-white",
    "bg-green-600",
    "bg-green-700",
    "bg-red-50",
    "bg-red-600",

    // Text colors
    "text-gray-400",
    "text-gray-600",
    "text-gray-700",
    "text-gray-800",
    "text-blue-500",
    "text-blue-600",
    "text-blue-700",
    "text-blue-800",
    "text-white",
    "text-green-600",
    "text-green-700",
    "text-red-600",

    // Border colors
    "border-gray-100",
    "border-gray-200",
    "border-gray-300",
    "border-red-500",
    "border-blue-400",

    // Hover states
    "hover:bg-blue-700",
    "hover:bg-green-700",
    "hover:bg-gray-50",
    "hover:bg-gray-100",
    "hover:border-blue-400",
    "hover:border-gray-300",

    // Focus states
    "focus:ring-blue-500",

    // Sizing and spacing
    "h-2",
    "h-5",
    "h-20",
    "w-5",
    "w-20",
    "h-full",
    "w-full",
    "p-6",
    "p-8",
    "py-2",
    "py-4",
    "px-4",
    "px-6",
    "mt-3",
    "mt-6",
    "mb-2",
    "mb-3",
    "mb-8",
    "mr-2",
    "space-y-3",
    "max-w-xl",

    // Flex and layout
    "flex",
    "inline-flex",
    "flex-col",
    "items-center",
    "justify-center",
    "justify-between",

    // Typography
    "text-lg",
    "text-sm",
    "text-xl",
    "text-2xl",
    "font-medium",
    "font-bold",
    "italic",

    // Borders and rounding
    "border",
    "rounded-full",
    "rounded-lg",
    "rounded-xl",
    "shadow-lg",
    "shadow-md",
    "overflow-hidden",

    // Transforms and transitions
    "transform",
    "scale-105",
    "transition-all",
    "duration-200",
    "duration-500",
    "ease-out",

    // Animations
    "animate-spin",

    // States
    "opacity-80",
    "cursor-not-allowed",
  ],
  plugins: [],
};
