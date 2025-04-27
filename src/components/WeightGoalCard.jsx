import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, TrendingDown, Scale, Edit } from 'lucide-react';
import Link from 'next/link';

export default function WeightGoalCard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeight, setCurrentWeight] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/fitness/profile?userId=1'); // TODO: Get actual user ID
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setProfile(data);
            setCurrentWeight(data.weight); // Initially set to profile weight
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!profile || !profile.time_frame) return null;
    
    const createdDate = new Date(profile.created_at);
    const timeFrameDays = profile.time_frame * 7; // Convert weeks to days
    const targetDate = new Date(createdDate);
    targetDate.setDate(targetDate.getDate() + timeFrameDays);
    
    const now = new Date();
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  // Format target date
  const formatTargetDate = () => {
    if (!profile || !profile.created_at || !profile.time_frame) return null;
    
    const createdDate = new Date(profile.created_at);
    const timeFrameDays = profile.time_frame * 7; // Convert weeks to days
    const targetDate = new Date(createdDate);
    targetDate.setDate(targetDate.getDate() + timeFrameDays);
    
    return targetDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get color based on goal type
  const getGoalColor = () => {
    if (!profile || !profile.goal) return 'blue';
    return profile.goal === 'lose' ? 'red' : profile.goal === 'gain' ? 'green' : 'blue';
  };

  // Get goal icon
  const GoalIcon = () => {
    if (!profile || !profile.goal) return <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />;
    if (profile.goal === 'lose') return <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />;
    if (profile.goal === 'gain') return <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />;
    return <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 shadow-lg h-36 sm:h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profile || !profile.goal || profile.goal === 'maintain') {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 shadow-lg h-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center">
            <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-1.5 sm:mr-2" />
            <h3 className="text-base sm:text-lg font-medium text-white">Weight Management</h3>
          </div>
          <Link href="/fitness/profile">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8">
              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
        
        <p className="text-white/80 text-sm sm:text-base mb-3 sm:mb-4">
          {profile 
            ? `Your goal is to maintain your current weight of ${profile.weight} kg.`
            : "You haven't set up your weight goals yet. Visit your profile to get started."}
        </p>
        
        {!profile && (
          <Link href="/fitness/profile">
            <Button className="bg-gray-800/30 border border-white/10 hover:bg-zinc-700 w-full text-xs sm:text-sm h-8 sm:h-10">
              Set Weight Goals
            </Button>
          </Link>
        )}
      </div>
    );
  }

  const color = getGoalColor();
  const daysRemaining = calculateDaysRemaining();
  const targetDate = formatTargetDate();

  return (
    <div className={`bg-${color}-500/10 backdrop-blur-sm border border-${color}-500/20 rounded-lg p-4 sm:p-6 shadow-lg h-full`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <GoalIcon />
          <h3 className="text-base sm:text-lg font-medium text-white ml-1.5 sm:ml-2">
            {profile.goal === 'lose' ? 'Weight Loss Goal' : 'Weight Gain Goal'}
          </h3>
        </div>
        <Link href="/fitness/profile">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8">
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="p-2.5 sm:p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-white/60 mb-0.5 sm:mb-1">Current</p>
          <p className="text-base sm:text-lg font-bold text-white">
            {currentWeight} kg
          </p>
        </div>
        
        <div className="p-2.5 sm:p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-white/60 mb-0.5 sm:mb-1">Target</p>
          <p className="text-base sm:text-lg font-bold text-white">
            {profile.target_weight} kg
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0 mb-3 sm:mb-4">
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 mr-1 sm:mr-1.5" />
          <span className="text-white/60">
            {daysRemaining} days left
          </span>
        </div>
        <span className="text-white/60 text-xs">
          Goal date: {targetDate}
        </span>
      </div>
      
      <div className="pt-2.5 sm:pt-4 border-t border-white/10">
        <p className="text-xs sm:text-sm text-white/80">
          Change rate: <span className="font-medium">{profile.weight_change_rate} kg/week</span>
        </p>
      </div>
    </div>
  );
} 