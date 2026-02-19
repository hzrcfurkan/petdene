"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useSession } from "next-auth/react"

export function HeaderActions() {
	const { data: session } = useSession()

	return (
		<div className="flex items-center gap-4">
			<ThemeToggle variant="switch" />
			{session?.user ? (
				<Link href="/customer">
					<Button variant="outline">Dashboard</Button>
				</Link>
			) : (
				<>
					<Link href="/signin">
						<Button variant="outline" className="gap-2 bg-transparent">
							<LogIn className="w-4 h-4" />
							Sign In
						</Button>
					</Link>
					<Link href="/signup">
						<Button>Sign Up</Button>
					</Link>
				</>
			)}
		</div>
	)
}

