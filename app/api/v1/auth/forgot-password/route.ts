import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { Resend } from "resend"
import { baseUrl } from "@/lib/utils"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json()

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 })
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { email },
		})

		// Always return success to prevent email enumeration
		if (!user) {
			return NextResponse.json({ message: "If that email exists, we've sent a password reset link" })
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex")
		const expires = new Date()
		expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

		// Store token in VerificationToken table
		await prisma.verificationToken.upsert({
			where: {
				identifier_token: {
					identifier: email,
					token: resetToken,
				},
			},
			update: {
				token: resetToken,
				expires,
			},
			create: {
				identifier: email,
				token: resetToken,
				expires,
			},
		})

		// Send reset email
		const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

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
						.button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
						.footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
						.warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 16px 0; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>Reset Your Password</h1>
						</div>

						<div class="section">
							<p>Hello ${user.name || "User"},</p>
							<p>We received a request to reset your password. Click the button below to create a new password:</p>
						</div>

						<div style="text-align: center; margin: 24px 0;">
							<a href="${resetLink}" class="button">Reset Password</a>
						</div>

						<div class="warning">
							<p style="margin: 0; font-size: 14px;"><strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
						</div>

						<div class="section">
							<p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
							<p style="color: #6b7280; font-size: 12px; word-break: break-all;">${resetLink}</p>
						</div>

						<div class="footer">
							<p>© 2025 Spa Booking. All rights reserved.</p>
						</div>
					</div>
				</body>
			</html>
		`

		try {
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || "noreply@spabooking.com",
				to: email,
				subject: "Reset Your Password - Spa Booking",
				html: emailHtml,
			})
		} catch (emailError) {
			console.error("Failed to send password reset email:", emailError)
			// Still return success to prevent email enumeration
		}

		return NextResponse.json({ message: "If that email exists, we've sent a password reset link" })
	} catch (error) {
		console.error("Forgot password error:", error)
		return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
	}
}

