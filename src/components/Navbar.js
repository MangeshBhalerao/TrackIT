'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, BookText, Dumbbell, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Tasks', href: '/tasks', icon: Calendar },
    { name: 'Documents', href: '/documents', icon: BookText },
    { name: 'Fitness', href: '/fitness', icon: Dumbbell },
  ]
  
  const isActive = (path) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-white border-b bg-white/2 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            TrackIT
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-white/80 ${
                    isActive(link.href) ? 'text-white' : 'text-white/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/95 border-white/10 text-white p-0">
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-xl font-bold" onClick={() => setMobileMenuOpen(false)}>
                      TrackIT
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex flex-col space-y-6">
                    {navLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={`flex items-center space-x-3 text-lg font-medium transition-colors hover:text-white/80 ${
                            isActive(link.href) ? 'text-white' : 'text-white/60'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
} 