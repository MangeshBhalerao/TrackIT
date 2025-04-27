'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, ExternalLink, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleSendTestEmail = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter an email address')
      return
    }
    
    setLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`/api/tasks/reminder/test?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }
      
      setTestResult({
        success: true,
        message: 'Test email sent successfully! Check your inbox for the test message.'
      })
      toast.success('Test email sent')
    } catch (error) {
      console.error('Error sending test email:', error)
      setTestResult({
        success: false,
        message: error.message
      })
      toast.error(`Failed to send email: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendAlternativeTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }
    
    setLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`/api/tasks/reminder/test-alternate?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }
      
      setTestResult({
        success: true,
        message: 'Alternative test email sent! Please check your inbox and spam folders.'
      })
      toast.success('Alternative test email sent')
    } catch (error) {
      console.error('Error sending alternative test email:', error)
      setTestResult({
        success: false,
        message: `Alternative method failed: ${error.message}`
      })
      toast.error(`Failed to send alternative email: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-8">
        <Link href="/tasks/settings">
          <Button variant="ghost" className="text-white sm:mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Test Email Delivery</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto bg-black border border-zinc-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <p className="text-zinc-300 mb-4">
            Send a test email to verify that your reminder system is working correctly.
          </p>
        </div>

        <form onSubmit={handleSendTestEmail} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <div className="flex">
              <div className="bg-zinc-800/50 flex items-center pl-3 rounded-l-md border-y border-l border-zinc-700">
                <Mail className="h-4 w-4 text-zinc-400" />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-black border-zinc-700 text-white rounded-l-none"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </Button>
        </form>

        {email && (
          <div className="mt-3">
            <Button
              type="button" 
              disabled={loading}
              onClick={handleSendAlternativeTestEmail}
              className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-white border border-emerald-700/50"
            >
              Try Alternative Method
            </Button>
            <p className="text-xs text-zinc-500 mt-1 text-center">
              If the main method doesn&apos;t work, try this alternative
            </p>
          </div>
        )}

        {testResult && (
          <div className={`mt-6 p-4 rounded-md border ${
            testResult.success ? 'border-green-500/30 bg-green-950/20' : 'border-red-500/30 bg-red-950/20'
          }`}>
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h3 className={`font-medium ${testResult.success ? 'text-green-300' : 'text-red-300'} mb-1`}>
                  {testResult.success ? 'Email Sent Successfully' : 'Failed to Send Email'}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <h3 className="text-white font-medium mb-3">How email testing works:</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex gap-2">
              <span className="font-mono bg-zinc-800 px-1.5 rounded text-xs text-white">1</span>
              We use Gmail SMTP to send actual emails
            </li>
            <li className="flex gap-2">
              <span className="font-mono bg-zinc-800 px-1.5 rounded text-xs text-white">2</span>
              Test emails are delivered directly to your inbox
            </li>
            <li className="flex gap-2">
              <span className="font-mono bg-zinc-800 px-1.5 rounded text-xs text-white">3</span>
              Check your spam folder if you don&apos;t see the email
            </li>
            <li className="flex gap-2">
              <span className="font-mono bg-zinc-800 px-1.5 rounded text-xs text-white">4</span>
              Gmail limits: 500 emails per day for free accounts
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}