import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { baseUrl } from "@/lib/utils"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
	try {
		const { name, email, phone } = await req.json()

		// Validate input
		if (!name || !email || !phone) {
			return NextResponse.json({ error: "Name, email, and phone number are required" }, { status: 400 })
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
		}

		// Create new guest user with a temporary password
		const tempPassword = Math.random().toString(36).slice(-12)
		const hashedPassword = await bcrypt.hash(tempPassword, 10)

		const user = await prisma.user.create({
			data: {
				name,
				email,
				phone,
				password: hashedPassword,
				role: "CUSTOMER",
			},
		})

		const resetLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}`

		const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 32px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin-bottom: 24px; }
            .section h2 { color: #1f2937; font-size: 18px; margin-bottom: 16px; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
            .info-box { background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Luxury Nail Spa!</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Your account has been created</p>
            </div>

            <div class="section">
              <h2>Hello ${name},</h2>
              <p style="color: #6b7280; line-height: 1.6;">
                Thank you for booking with us! Your guest account has been successfully created. 
                To secure your account and set your own password, please click the button below.
              </p>
            </div>

            <div class="info-box">
              <p style="margin: 0; color: #1f2937;"><strong>Account Details:</strong></p>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                Email: ${email}<br/>
                Phone: ${phone}
              </p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" class="button">Set Your Password</a>
            </div>

            <div class="section">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't create this account or have any questions, please contact our support team.
              </p>
            </div>

            <div class="footer">
              <p>© 2025 Luxury Nail Spa. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

		try {
			await resend.emails.send({
				from: "bookings@luxurynailspa.com",
				to: email,
				subject: "Welcome to Luxury Nail Spa - Set Your Password",
				html: emailHtml,
			})
		} catch (emailError) {
			console.error("[v0] Failed to send password reset email:", emailError)
			// Don't fail the signup if email fails, but log it
		}

		return NextResponse.json(
			{
				success: true,
				userId: user.id,
				message: "Guest account created successfully. Check your email to set your password.",
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error("[v0] Guest signup error:", error)
		return NextResponse.json({ error: "Failed to create guest account" }, { status: 500 })
	}
}
