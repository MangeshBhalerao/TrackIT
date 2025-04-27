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
      className="py-8 sm:py-12 min-h-[calc(100vh-64px)]"
      style={{
        backgroundImage: "url('')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white">
          Welcome to TrackIT
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-white/90 max-w-2xl mx-auto">
          Your all-in-one platform for managing student life. Stay organized,
          focused, and healthy.
        </p>
      </div>

      <div className="mx-auto mt-10 sm:mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="bg-white/5 backdrop-blur-md rounded-lg p-4 sm:p-6 hover:bg-white/10 transition-colors duration-300 border border-white/5 hover:border-white/10 flex flex-col h-full"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg text-white">{feature.name}</h3>
                  <p className="text-sm text-white/80 mt-auto">
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