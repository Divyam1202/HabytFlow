import { createAuthClient } from "better-auth/react"
import { emailOTPClient, usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  plugins: [
    usernameClient(),
    emailOTPClient()
  ]
})
