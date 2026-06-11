import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { nextCookies } from "better-auth/next-js"
import { emailOTP, username } from "better-auth/plugins"
import { dash } from "@better-auth/infra"
import nodemailer from "nodemailer"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.")
}

// Global caching for the raw MongoClient to survive Next.js / Vercel Serverless re-execution
let client: MongoClient
let db: any

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(MONGODB_URI)
  db = client.db()
} else {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
  }
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(MONGODB_URI)
  }
  client = globalWithMongo._mongoClient
  db = client.db()
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const auth = betterAuth({
  // Dynamically uses current deployment domain fallback safely
  baseURL: process.env.BETTER_AUTH_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000"),
  database: mongodbAdapter(db),
  trustedOrigins: [
    "https://habit-flow-wheat.vercel.app",
    "https://habit-flow-ten-murex.vercel.app",
    "http://127.0.0.1:3000",
    "http://localhost:3000"
  ],
  plugins: [
    dash(),
    username(),
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[Better Auth] Sending ${type} OTP to ${email}: ${otp}`)

        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Your HabitFlow OTP: ${otp}`,
            text: `Your One-Time Password is ${otp}`,
          })
        }
      }
    })
  ],
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    requireVerification: true,
    autoSignInAfterVerification: true,
    sendOnSignUp: false
  },
  advanced: {
    // Force cross-site secure cookie protocols natively on live domains
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultTheme: "dark",
    ipAddress: {
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],
    },
  }
})