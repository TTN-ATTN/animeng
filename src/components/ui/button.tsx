// Button source code from Shadcn
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Định nghĩa các biến thể (variants) của button với class tương ứng
// https://flowbite.com/docs/components/buttons/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer", // Added `cursor-pointer` to change the cursor
  {
    variants: {
      variant: {
        primaryOutline: "border-blue-500 text-blue-500 hover:bg-blue-100", // Add primaryOutline
        primary: "bg-blue-500 text-white hover:bg-blue-600", // Add primary
        dangerOutline: "border-red-500 text-red-500 hover:bg-red-100", // Add dangerOutline
        default:
          "bg-white text-black border border-state-200 bordere-2 border-b-4 active:border-b-2 hover:bg-slate-100 text-slate-600",
        greenBtn: "bg-green-400 text-primary-foreground hover:bg-green-400/90 border-green-600 border-b-4 active:border-b-0",
        blueBtn: "bg-blue-400 text-primary-foreground hover:bg-sky-400/90 border-sky-600 border-b-4 active:border-b-0",
        redBtn: "bg-rose-400 text-primary-foreground hover:bg-rose-400/90 border-rose-600 border-b-4 active:border-b-0",
        purpleBtn: "bg-purple-400 text-primary-foreground hover:bg-purple-400/90 border-purple-600 border-b-4 active:border-b-0",
        yellowBtn: "bg-yellow-400 text-primary-foreground hover:bg-yellow-400/90 border-yellow-600 border-b-4 active:border-b-0",
        lockedBtn: "bg-white text-black border border-state-200 bordere-2 border-b-4 active:border-b-2 hover:bg-slate-100 text-slate-600",
        secondary: "bg-green-200 text-black hover:bg-green-300 active:bg-green-400",
        danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700", // Add danger
    },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        round: "rounded-full h-15 w-15",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Component Button với hỗ trợ các biến thể và tùy chọn `asChild`
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button" // Cho phép sử dụng Slot nếu `asChild` được bật

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Xuất các thành phần để sử dụng
export { Button, buttonVariants }
