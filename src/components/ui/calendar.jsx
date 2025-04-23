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
      className={cn("p-4 bg-slate-900 rounded-lg border border-slate-700 shadow-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 pb-4 relative items-center",
        caption_label: "text-lg font-bold text-white tracking-wide",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-slate-800 border-slate-600 p-0 text-white hover:bg-slate-700 hover:border-slate-500"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse border-spacing-2",
        head_row: "flex mt-2",
        head_cell: "text-slate-300 rounded-md w-10 font-semibold text-xs uppercase tracking-wider",
        row: "flex w-full mt-3",
        cell: "relative p-0 text-center text-sm rounded-md focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium text-sm rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white shadow-sm aria-selected:opacity-100 text-white"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white border-blue-500 shadow-md",
        day_today: "bg-purple-700 text-white font-bold border border-purple-400 shadow-md",
        day_outside: "day-outside bg-slate-900 text-slate-400 opacity-50",
        day_disabled: "text-slate-500 bg-slate-900/50 line-through opacity-40",
        day_range_middle: "aria-selected:bg-blue-700 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-5 w-5 text-slate-300" />,
        IconRight: () => <ChevronRight className="h-5 w-5 text-slate-300" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"
