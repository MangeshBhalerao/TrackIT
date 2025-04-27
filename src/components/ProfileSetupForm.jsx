import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';

export default function ProfileSetupForm({ onComplete }) {
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '', // in cm
    weight: '', // in kg
    activityLevel: '',
    goal: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

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
              goal: data.goal || ''
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

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    for (const [key, value] of Object.entries(profile)) {
      if (!value) {
        toast.error(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    setLoading(true);
    console.log('Submitting profile data:', profile);
    
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

      console.log('Profile saved successfully:', responseData);
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
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
              <Label className="text-white">Weight (kg)</Label>
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
          </div>
          
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <Label className="text-white">Goal</Label>
            <Select
              value={profile.goal}
              onValueChange={(value) => handleChange('goal', value)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                <SelectItem value="lose">Lose weight</SelectItem>
                <SelectItem value="maintain">Maintain weight</SelectItem>
                <SelectItem value="gain">Gain weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gray-800/30 border border-white/10 hover:bg-gray-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : (hasProfile ? 'Update Profile' : 'Save Profile')}
        </Button>
      </form>
    </div>
  );
} 