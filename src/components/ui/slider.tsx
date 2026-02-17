import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/data/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center py-4", // Added padding for easier clicking
      className
    )}
    {...props}
  >
    {/* The Background Track - Made it darker/clearer */}
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-800 border border-white/5">
      {/* The Filled Range - Made it Indigo with a slight glow */}
      <SliderPrimitive.Range className="absolute h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
    </SliderPrimitive.Track>

    {/* The Handles (Thumbs) - Added 2 Thumbs for Range support */}
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-indigo-400 bg-white shadow-lg transition-transform active:scale-110 focus-visible:outline-none disabled:pointer-events-none" />
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-indigo-400 bg-white shadow-lg transition-transform active:scale-110 focus-visible:outline-none disabled:pointer-events-none" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
