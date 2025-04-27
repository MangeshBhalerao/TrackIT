'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, User } from 'lucide-react'
import Link from 'next/link'
import ProfileSetupForm from '@/components/ProfileSetupForm'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user already has a profile
    const checkProfile = async () => {
      try {
        const response = await fetch('/api/fitness/profile?userId=1'); // TODO: Get actual user ID
        if (response.ok) {
          const data = await response.json();
          setHasProfile(data && data.id);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        toast.error('Failed to check profile status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProfile();
  }, []);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
        <Link href="/fitness">
          <Button variant="ghost" className="text-white text-sm sm:text-base sm:mr-4 px-2 sm:px-4">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Back to Fitness
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Profile</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto bg-white/5 rounded-lg p-4 sm:p-6 md:p-8 border border-white/10">
        {isLoading ? (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
              <div className="p-2.5 sm:p-3 bg-blue-500/20 rounded-full">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
              <div className="sm:ml-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {hasProfile ? 'Update Your Profile' : 'Set Up Your Profile'}
                </h2>
                <p className="text-sm sm:text-base text-white/70">
                  {hasProfile 
                    ? 'Update your information to recalculate your daily calorie goals'
                    : 'Complete your profile to get personalized calorie goals'}
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <ProfileSetupForm
                onComplete={(profile) => {
                  setHasProfile(true);
                  toast.success(
                    `Your daily calorie goal: ${profile.daily_calorie_goal} calories`,
                    { duration: 5000 }
                  );
                }}
              />
            </div>

            {hasProfile && (
              <div className="mt-6 sm:mt-8 bg-white/5 rounded-lg p-4 sm:p-6 border border-white/10">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-1.5 sm:mr-2" />
                  <h3 className="text-base sm:text-lg font-medium text-white">Fitness Tips</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-white/80">
                  <li>• Aim to get at least 150 minutes of moderate activity per week</li>
                  <li>• Strength training exercises should be done at least twice a week</li>
                  <li>• Stay hydrated by drinking at least 8 glasses of water daily</li>
                  <li>• Focus on a balanced diet with protein, complex carbs, and healthy fats</li>
                  <li>• Consistency is more important than intensity when starting out</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 