"use client"

import SigninForm from '@/components/features/auth/signin-form'
import LayoutAuth from "@/components/layout/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"

function SignInContent() {
	return (
		<LayoutAuth>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-2">
					<CardTitle className="text-3xl font-bold">
						Welcome Back
					</CardTitle>
					<CardDescription>Sign in to your spa booking account</CardDescription>
				</CardHeader>
				<CardContent>
					<SigninForm />
					<div className="mt-4 text-center text-sm">
						<span className="text-muted-foreground">Don't have an account? </span>
						<Link href="/signup" className="text-primary hover:underline">
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</LayoutAuth>
	)
}

export default function SignInPage() {
	return (
		<Suspense fallback={
			<LayoutAuth>
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="text-center">Loading...</div>
					</CardContent>
				</Card>
			</LayoutAuth>
		}>
			<SignInContent />
		</Suspense>
	)
}
