
'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please check environment variables.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this application.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Callback':
        return 'OAuth callback failed. This may be due to missing environment variables (NEXTAUTH_SECRET, DATABASE_URL) or database connection issues. Please check Vercel environment variables.'
      case 'OAuthSignin':
        return 'Error constructing OAuth request. Check Google OAuth credentials.'
      case 'OAuthCallback':
        return 'Error handling OAuth callback. Check redirect URIs in Google Cloud Console.'
      case 'OAuthCreateAccount':
        return 'Could not create account. Check database connection and Prisma schema.'
      case 'EmailCreateAccount':
        return 'Could not create account with email.'
      case 'Signin':
        return 'Error signing in. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'Email already exists with a different provider.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return `An authentication error occurred${error ? `: ${error}` : '.'}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-lg border-slate-700">
        <CardHeader className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <CardTitle className="text-2xl font-bold text-white">
            Authentication Error
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-300">
            {getErrorMessage(error)}
          </p>
          
          <div className="space-y-2">
            <Link href="/" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </Link>
            
            <p className="text-xs text-gray-400">
              If the problem persists, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
