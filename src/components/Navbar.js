'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, BookText, Dumbbell, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const pathname = usePathname()

  

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-white border-b bg-white/2 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            TrackIT
          </Link>
          
        </div>
      </div>
    </nav>
  )
} 