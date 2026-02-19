import "server-only"

import { prisma } from "@/lib/db/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { baseUrl } from "@/lib/utils/base-url"
import bcrypt from "bcryptjs"
import { getServerSession, type NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Custom adapter wrapper to ensure role is set for OAuth users
const baseAdapter = PrismaAdapter(prisma)
const customAdapter = {
	...baseAdapter,
	async createUser(data: any) {
		// Ensure role is set when creating user
		const userData = {
			...data,
			role: data.role || "CUSTOMER",
		}
		return baseAdapter.createUser(userData)
	},
}

export const authOptions: NextAuthOptions = {
	adapter: customAdapter as any,
	// Set the base URL for NextAuth
	url: baseUrl,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
			allowDangerousEmailAccountLinking: true,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required")
				}

				// Normalize email (lowercase and trim)
				const email = credentials.email.trim().toLowerCase()

				const user = await prisma.user.findUnique({
					where: { email },
				})

				// Check if user exists
				if (!user) {
					throw new Error("No account found with this email")
				}

				// Check if user has a password (not OAuth-only user)
				if (!user.password) {
					throw new Error("This account was created with Google. Please sign in with Google instead.")
				}

				// Compare passwords
				try {
					const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
					if (!isPasswordValid) {
						throw new Error("Incorrect password")
					}
				} catch (compareError) {
					console.error("Password comparison error:", compareError)
					throw new Error("Incorrect password")
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
					role: user.role,
				}
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			// PrismaAdapter automatically creates User and Account for OAuth providers
			// Return true to allow sign in - we'll handle role in jwt callback
			return true
		},
		async jwt({ token, user, account, trigger }) {
			// On first sign in (when user object exists), set user data
			if (user) {
				token.id = user.id
				
				// For credentials provider, role comes from user object
				if (account?.provider === "credentials") {
					token.role = (user as any).role || "CUSTOMER"
				} 
				// For OAuth providers, fetch role from database
				else if (account?.provider === "google" && user.email) {
					try {
						// PrismaAdapter creates the user, so it should exist now
						const dbUser = await prisma.user.findUnique({
							where: { email: user.email },
							select: { role: true, id: true },
						})
						
						if (dbUser) {
							// If role is missing, set default role
							if (!dbUser.role) {
								await prisma.user.update({
									where: { id: dbUser.id },
								data: { role: "CUSTOMER" },
							})
							token.role = "CUSTOMER"
							} else {
								token.role = dbUser.role
							}
							token.id = dbUser.id
						} else {
							// User doesn't exist yet (shouldn't happen with adapter, but fallback)
							token.role = "CUSTOMER"
						}
					} catch (error) {
						console.error("Error fetching user role in jwt:", error)
						token.role = "CUSTOMER"
					}
				} else {
					token.role = "CUSTOMER"
				}
			}
			
			// On session update, refresh role from database
			if (trigger === "update" && token.email) {
				try {
					const dbUser = await prisma.user.findUnique({
						where: { email: token.email as string },
						select: { role: true, id: true },
					})
					if (dbUser) {
						token.role = dbUser.role || "CUSTOMER"
						token.id = dbUser.id
					}
				} catch (error) {
					console.error("Error refreshing user role:", error)
				}
			}
			
			// Ensure role is always set (fallback to CUSTOMER)
			if (!token.role) {
				token.role = "CUSTOMER"
			}
			
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				;(session.user as any).id = token.id as string
				;(session.user as any).role = (token.role as string) || "CUSTOMER"
			}
			return session
		},
	},
	pages: {
		signIn: "/signin",
		signOut: "/",
		error: "/signin?error=CredentialsSignin",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === "development",
	// Ensure proper URL configuration for Vercel
	trustHost: true,
	// Cookie configuration for Vercel
	cookies: {
		sessionToken: {
			name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
				// Domain should be set automatically by Vercel
			},
		},
	},
}

export async function getAuthSession() {
	return await getServerSession(authOptions)
}
