import SignupForm from '@/components/features/auth/signup-form'
import LayoutAuth from "@/components/layout/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpPage() {

	return (
		<LayoutAuth>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-2">
					<CardTitle className="text-3xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
						Create Account
					</CardTitle>
					<CardDescription>Sign up for your spa booking account</CardDescription>
				</CardHeader>
				<CardContent>
					<SignupForm />
					<div className="mt-4 text-center text-sm">
						<span className="text-muted-foreground">Already have an account? </span>
						<Link href="/signin" className="text-primary hover:underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</LayoutAuth>
	)
}
