'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Settings, Mail, Bell, TestTube } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function TaskSettingsPage() {
  const [preferences, setPreferences] = useState({
    email: '',
    enableReminders: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/tasks/preferences?userId=1'); // TODO: Use actual user ID
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setPreferences({
              email: data.email || '',
              enableReminders: data.enable_reminders !== false
            });
          }
        }
      } catch (error) {
        console.error('Error fetching task preferences:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, []);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (preferences.enableReminders && !preferences.email) {
      toast.error('Please enter an email address for notifications');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/tasks/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // TODO: Use actual user ID
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(`Failed to save preferences: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-8">
        <Link href="/tasks">
          <Button variant="ghost" className="text-white sm:mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Task Settings</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto bg-black border border-zinc-800 rounded-lg p-6 shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600/20 rounded-full">
                <Settings className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableReminders" className="text-white mb-1 block">Email Reminders</Label>
                    <p className="text-zinc-400 text-sm">Receive email reminders for your scheduled tasks</p>
                  </div>
                  <Switch
                    id="enableReminders"
                    checked={preferences.enableReminders}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, enableReminders: checked })}
                  />
                </div>

                {preferences.enableReminders && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <div className="flex">
                      <div className="bg-zinc-800/50 flex items-center pl-3 rounded-l-md border-y border-l border-zinc-700">
                        <Mail className="h-4 w-4 text-zinc-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={preferences.email}
                        onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="bg-black border-zinc-700 text-white rounded-l-none"
                        required={preferences.enableReminders}
                      />
                    </div>
                    <p className="text-zinc-400 text-xs mt-1">
                      We&apos;ll send reminders 30 minutes before scheduled tasks.
                    </p>
                    
                    <div className="mt-3">
                      <Link href="/tasks/settings/test-email">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mt-2 border border-zinc-700 bg-zinc-800/30 text-white hover:bg-zinc-700/50"
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Email Functionality
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="pt-2 mt-6">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gray-800/30 border-1 border-gray-800 text-white hover:bg-blue-900 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 