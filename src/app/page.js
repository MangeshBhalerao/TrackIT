import Link from 'next/link'
import { Calendar, BookText, Dumbbell } from 'lucide-react'

export default function Home() {
  const features = [
    {
      name: 'Task Management',
      description: 'Keep track of assignments, deadlines, and personal tasks',
      icon: Calendar,
      href: '/tasks',
    },
    {
      name: 'Document Storage',
      description: 'Store and organize your study materials and important files',
      icon: BookText,
      href: '/documents',
    },
    {
      name: 'Fitness Tracking',
      description: 'Monitor your workouts and maintain a healthy lifestyle',
      icon: Dumbbell,
      href: '/fitness',
    },
  ]

  return (
    <div 
      className="py-12 min-h-screen"
      style={{
        backgroundImage: "url('')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
          Welcome to TrackIT
        </h1>
        <p className="mt-6 text-lg leading-8 text-white">
          Your all-in-one platform for managing student life. Stay organized,
          focused, and healthy.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="bg-white/5 backdrop-blur-md rounded-lg p-6 hover:bg-white/40 transition-colors"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{feature.name}</h3>
                  <p className="text-sm text-white/90">
                    {feature.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}