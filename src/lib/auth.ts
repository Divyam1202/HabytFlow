import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import nodemailer from "nodemailer"

const client = new MongoClient(process.env.MONGODB_URI as string)
const db = client.db()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const auth = betterAuth({
  database: mongodbAdapter(db),
  plugins: [
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
    sendOnSignUp: false // We will trigger the OTP manually
  }
})
