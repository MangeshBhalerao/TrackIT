"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rounded-md", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-bold text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-black/50 border-slate-700/50 p-0 text-white hover:bg-black/70"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-slate-300 rounded-md w-10 font-bold text-sm uppercase",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-700/70 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-bold text-lg bg-black/40 backdrop-blur-sm border border-slate-800/50 text-white hover:bg-black/60 hover:text-white focus:bg-black/60 focus:text-white"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-purple-500/80 text-white hover:bg-purple-500/90 hover:text-white focus:bg-purple-500/80 focus:text-white border-purple-500/60",
        day_today: "bg-slate-800/80 text-white font-bold border-2 border-slate-600/90",
        day_outside: "day-outside bg-black/40 text-slate-500/90 opacity-50",
        day_disabled: "text-slate-500/80 bg-black/30 line-through opacity-50",
        day_range_middle: "aria-selected:bg-slate-700/60 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-6 w-6 text-white" />,
        IconRight: () => <ChevronRight className="h-6 w-6 text-white" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"
