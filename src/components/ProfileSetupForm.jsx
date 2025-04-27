import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, TrendingUp, TrendingDown, Scale, Flame } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

export default function ProfileSetupForm({ onComplete }) {
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '', // in cm
    weight: '', // in kg
    activityLevel: '',
    goal: '',
    targetWeight: '', // target weight in kg
    timeFrame: 12, // weeks to achieve goal
    weightChangeRate: 0.5, // kg per week
  });
  
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Calculate estimated goal date
  const getGoalDate = () => {
    if (!profile.timeFrame) return null;
    const date = new Date();
    date.setDate(date.getDate() + (profile.timeFrame * 7));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate calorie adjustment based on goals
  const getCalorieAdjustment = () => {
    if (!profile.weightChangeRate) return 0;
    
    // ~7700 calories = 1kg of weight change
    const caloriesPerDay = Math.round((7700 * profile.weightChangeRate) / 7);
    
    return profile.goal === 'lose' 
      ? -caloriesPerDay 
      : profile.goal === 'gain' 
        ? caloriesPerDay 
        : 0;
  };

  useEffect(() => {
    // Check if user already has a profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/fitness/profile?userId=1'); // TODO: Get actual user ID
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setProfile({
              age: data.age || '',
              gender: data.gender || '',
              height: data.height || '',
              weight: data.weight || '',
              activityLevel: data.activity_level || '',
              goal: data.goal || '',
              targetWeight: data.target_weight || '',
              timeFrame: data.time_frame || 12,
              weightChangeRate: data.weight_change_rate || 0.5,
            });
            setHasProfile(true);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, []);

  useEffect(() => {
    // Auto-calculate target weight if not set and weight is available
    if (profile.weight && profile.goal && !profile.targetWeight) {
      let targetWeight = parseFloat(profile.weight);
      
      if (profile.goal === 'lose') {
        targetWeight = Math.max(targetWeight - 5, 45); // Default to losing 5kg, min 45kg
      } else if (profile.goal === 'gain') {
        targetWeight = targetWeight + 5; // Default to gaining 5kg
      }
      
      setProfile(prev => ({
        ...prev,
        targetWeight: targetWeight.toFixed(1)
      }));
    }
  }, [profile.weight, profile.goal]);

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profile.age || !profile.gender || !profile.height || !profile.weight || 
        !profile.activityLevel || !profile.goal) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Goal-specific validation
    if (profile.goal !== 'maintain' && (!profile.targetWeight || !profile.timeFrame)) {
      toast.error('Please set your target weight and time frame');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/fitness/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // TODO: Get actual user ID
          profileData: profile
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Profile save error:', responseData);
        throw new Error(responseData.error || 'Failed to save profile');
      }

      toast.success(hasProfile ? 'Profile updated successfully' : 'Profile created successfully');
      setHasProfile(true);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(responseData);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 sm:mb-8 bg-white/5">
          <TabsTrigger value="basic" className="data-[state=active]:bg-gray-800/40 hover:bg-gray-700 text-xs sm:text-sm py-1.5 sm:py-2">
            <span className="flex items-center">
              <Scale className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Basic Info
            </span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-gray-800/40 hover:bg-gray-700 text-xs sm:text-sm py-1.5 sm:py-2">
            <span className="flex items-center">
              <Target className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Weight Goals
            </span>
          </TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="basic" className="space-y-4 sm:space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-white text-xs sm:text-sm">Age</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={profile.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
                  className="bg-white/5 border-white/10 text-white h-8 sm:h-10 text-xs sm:text-sm"
                  required
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-white text-xs sm:text-sm">Gender</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="male" className="text-xs sm:text-sm">Male</SelectItem>
                    <SelectItem value="female" className="text-xs sm:text-sm">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-white text-xs sm:text-sm">Height (cm)</Label>
                <Input
                  type="number"
                  min="50"
                  max="250"
                  value={profile.height}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value) || '')}
                  className="bg-white/5 border-white/10 text-white h-8 sm:h-10 text-xs sm:text-sm"
                  required
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-white text-xs sm:text-sm">Current Weight (kg)</Label>
                <Input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={profile.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
                  className="bg-white/5 border-white/10 text-white h-8 sm:h-10 text-xs sm:text-sm"
                  required
                />
              </div>
            
              <div className="space-y-1.5 sm:space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-white text-xs sm:text-sm">Activity Level</Label>
                <Select
                  value={profile.activityLevel}
                  onValueChange={(value) => handleChange('activityLevel', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="sedentary" className="text-xs sm:text-sm">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light" className="text-xs sm:text-sm">Lightly active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate" className="text-xs sm:text-sm">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active" className="text-xs sm:text-sm">Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active" className="text-xs sm:text-sm">Very active (very hard exercise, physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setActiveTab('goals')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-10"
              >
                Next: Weight Goals
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4 sm:space-y-6 animate-fadeIn">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-white text-xs sm:text-sm">Your Goal</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <Button 
                  type="button"
                  variant={profile.goal === 'lose' ? 'default' : 'outline'}
                  onClick={() => handleChange('goal', 'lose')}
                  className={`flex items-center justify-center py-6 text-xs sm:text-sm h-auto ${
                    profile.goal === 'lose' ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' : 'text-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                    <span>Lose Weight</span>
                  </div>
                </Button>
                
                <Button 
                  type="button"
                  variant={profile.goal === 'maintain' ? 'default' : 'outline'}
                  onClick={() => handleChange('goal', 'maintain')}
                  className={`flex items-center justify-center py-6 text-xs sm:text-sm h-auto ${
                    profile.goal === 'maintain' ? 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30' : 'text-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Scale className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                    <span>Maintain</span>
                  </div>
                </Button>
                
                <Button 
                  type="button"
                  variant={profile.goal === 'gain' ? 'default' : 'outline'}
                  onClick={() => handleChange('goal', 'gain')}
                  className={`flex items-center justify-center py-6 text-xs sm:text-sm h-auto ${
                    profile.goal === 'gain' ? 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30' : 'text-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                    <span>Gain Weight</span>
                  </div>
                </Button>
              </div>
            </div>
            
            {profile.goal && profile.goal !== 'maintain' && (
              <div className="space-y-4 sm:space-y-6 bg-white/5 p-3 sm:p-5 rounded-lg border border-white/10">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-white text-xs sm:text-sm">Target Weight (kg)</Label>
                  <Input
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    value={profile.targetWeight}
                    onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value) || '')}
                    className="bg-white/5 border-white/10 text-white h-8 sm:h-10 text-xs sm:text-sm"
                    required={profile.goal !== 'maintain'}
                  />
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-white text-xs sm:text-sm">Time Frame (weeks)</Label>
                    <span className="text-white/70 text-xs sm:text-sm">{profile.timeFrame} weeks</span>
                  </div>
                  <Slider
                    value={[profile.timeFrame]}
                    min={4}
                    max={52}
                    step={1}
                    onValueChange={(value) => handleChange('timeFrame', value[0])}
                    className="py-1.5"
                  />
                  {profile.timeFrame && (
                    <div className="flex items-center mt-1 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/60 mr-1 sm:mr-1.5" />
                      <span className="text-white/70">Estimated completion: {getGoalDate()}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-white text-xs sm:text-sm">Weekly {profile.goal === 'lose' ? 'Loss' : 'Gain'} Rate (kg)</Label>
                    <span className="text-white/70 text-xs sm:text-sm">{profile.weightChangeRate} kg/week</span>
                  </div>
                  <Slider
                    value={[profile.weightChangeRate * 10]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleChange('weightChangeRate', value[0] / 10)}
                    className="py-1.5"
                  />
                  {profile.weightChangeRate && (
                    <div className="flex items-center mt-1 text-xs sm:text-sm">
                      <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/60 mr-1 sm:mr-1.5" />
                      <span className="text-white/70">
                        Calorie {profile.goal === 'lose' ? 'deficit' : 'surplus'} per day: {Math.abs(getCalorieAdjustment())} calories
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('basic')}
                className="border-white/20 hover:bg-white/10 text-white text-xs sm:text-sm h-8 sm:h-10"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-10"
              >
                {loading ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
} 