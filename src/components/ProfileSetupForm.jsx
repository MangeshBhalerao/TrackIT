import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, TrendingUp, TrendingDown, Scale } from 'lucide-react';
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
    weightChangeRate: 0.5 // kg per week
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
              weightChangeRate: data.weight_change_rate || 0.5
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
        <TabsList className="grid grid-cols-2 mb-8 bg-white/5">
          <TabsTrigger value="basic" className="data-[state=active]:bg-gray-800/40 hover:bg-gray-700">
            <span className="flex items-center">
              <Scale className="mr-2 h-4 w-4" />
              Basic Info
            </span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-gray-800/40 hover:bg-gray-700">
            <span className="flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Weight Goals
            </span>
          </TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <TabsContent value="basic" className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Age</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={profile.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Gender</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              <div className="space-y-2">
                <Label className="text-white">Height (cm)</Label>
                <Input
                  type="number"
                  min="50"
                  max="250"
                  value={profile.height}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value) || '')}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Current Weight (kg)</Label>
                <Input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={profile.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white">Activity Level</Label>
                <Select
                  value={profile.activityLevel}
                  onValueChange={(value) => handleChange('activityLevel', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Very active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Extra active (very hard exercise & physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white">Goal</Label>
                <Select
                  value={profile.goal}
                  onValueChange={(value) => handleChange('goal', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="lose">
                      <div className="flex items-center">
                        <TrendingDown className="mr-2 h-4 w-4 text-red-400" />
                        Lose weight
                      </div>
                    </SelectItem>
                    <SelectItem value="maintain">
                      <div className="flex items-center">
                        <Scale className="mr-2 h-4 w-4 text-blue-400" />
                        Maintain weight
                      </div>
                    </SelectItem>
                    <SelectItem value="gain">
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-green-400" />
                        Gain weight
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                className="bg-gray-800/30 border border-white/10 hover:bg-gray-700"
                onClick={() => setActiveTab("goals")}
                disabled={!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.activityLevel || !profile.goal}
              >
                Next: Set Goals
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-6 animate-fadeIn">
            {profile.goal === 'maintain' ? (
              <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                <div className="flex items-center mb-4">
                  <Scale className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-medium text-white">Weight Maintenance</h3>
                </div>
                <p className="text-white/80 mb-4">
                  Your goal is to maintain your current weight of {profile.weight} kg. 
                  We'll calculate your daily calorie needs to keep your weight stable.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`bg-${profile.goal === 'lose' ? 'red' : 'green'}-500/10 p-6 rounded-lg border border-${profile.goal === 'lose' ? 'red' : 'green'}-500/20`}>
                  <div className="flex items-center gap-2 mb-4">
                    {profile.goal === 'lose' ? 
                      <TrendingDown className="h-5 w-5 text-red-400" /> : 
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    }
                    <h3 className="text-lg font-medium text-white">
                      {profile.goal === 'lose' ? 'Weight Loss' : 'Weight Gain'} Goal
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Weight (kg)
                      </Label>
                      <Input
                        type="number"
                        min={profile.goal === 'lose' ? '40' : profile.weight}
                        max={profile.goal === 'gain' ? '300' : profile.weight}
                        step="0.1"
                        value={profile.targetWeight}
                        onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value) || '')}
                        className="bg-white/5 border-white/10 text-white"
                        required={profile.goal !== 'maintain'}
                      />
                      {profile.weight && profile.targetWeight && (
                        <p className="text-sm text-white/60">
                          {Math.abs(profile.weight - profile.targetWeight).toFixed(1)} kg to {profile.goal === 'lose' ? 'lose' : 'gain'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Time Frame (weeks)
                      </Label>
                      <Select
                        value={profile.timeFrame.toString()}
                        onValueChange={(value) => handleChange('timeFrame', parseInt(value))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select time frame" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                          <SelectItem value="4">4 weeks (1 month)</SelectItem>
                          <SelectItem value="8">8 weeks (2 months)</SelectItem>
                          <SelectItem value="12">12 weeks (3 months)</SelectItem>
                          <SelectItem value="16">16 weeks (4 months)</SelectItem>
                          <SelectItem value="24">24 weeks (6 months)</SelectItem>
                        </SelectContent>
                      </Select>
                      {profile.timeFrame && (
                        <p className="text-sm text-white/60">
                          Target date: {getGoalDate()}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-4 md:col-span-2">
                      <div className="flex justify-between">
                        <Label className="text-white flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Weight Change Rate (kg/week)
                        </Label>
                        <span className="text-sm font-medium text-white/90 bg-white/10 px-2 py-1 rounded">
                          {profile.weightChangeRate} kg/week
                        </span>
                      </div>
                      <Slider 
                        value={[profile.weightChangeRate * 10]} 
                        min={1} 
                        max={10} 
                        step={1}
                        className="py-4"
                        onValueChange={(value) => handleChange('weightChangeRate', value[0] / 10)}
                      />
                      <div className="flex justify-between text-xs text-white/60">
                        <span>Gradual (0.1 kg/week)</span>
                        <span>Maximum (1.0 kg/week)</span>
                      </div>
                      
                      {profile.weight && profile.targetWeight && profile.weightChangeRate && (
                        <div className="mt-2 p-3 bg-white/5 rounded-md border border-white/10">
                          <p className="text-sm text-white/80 flex flex-wrap items-center gap-1">
                            <span className="font-medium">Estimated calorie adjustment:</span>
                            <span className={`font-bold ${getCalorieAdjustment() < 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {getCalorieAdjustment() > 0 ? '+' : ''}{getCalorieAdjustment()} calories/day
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={() => setActiveTab("basic")}
              >
                Back
              </Button>
              
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading || (profile.goal !== 'maintain' && (!profile.targetWeight || !profile.timeFrame))}
              >
                {loading ? 'Saving...' : (hasProfile ? 'Update Profile' : 'Save Profile')}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
} 