
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db"

// Determine base URL for OAuth callbacks
function getBaseUrl() {
  // CRITICAL: Prioritize NEXTAUTH_URL to ensure consistent OAuth callbacks
  // This prevents preview deployment URLs from being used as callback URLs
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  // For Vercel production deployments without explicit NEXTAUTH_URL
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Default to localhost in development
  return 'http://localhost:3000'
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Allow sign in - user will be automatically created via PrismaAdapter
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      const actualBaseUrl = getBaseUrl()
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${actualBaseUrl}${url}`
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(actualBaseUrl)
        
        // If the URL is on our domain, preserve the path but use our base
        if (urlObj.hostname.includes('vercel.app') || urlObj.origin === baseUrlObj.origin) {
          // Extract path and redirect to our production domain
          return `${actualBaseUrl}${urlObj.pathname}${urlObj.search}${urlObj.hash}`
        }
      } catch (e) {
        // Invalid URL, fall through to default
      }
      
      // Default to app page after successful sign in
      return `${actualBaseUrl}/app`
    },
    session: ({ session, token }) => {
      if (session?.user && token) {
        (session.user as any).id = token.sub
      }
      return session
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
