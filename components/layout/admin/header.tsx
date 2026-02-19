"use client"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { currentUserClient, getRoleLabel } from "@/lib/auth/client"
import { Bell, Home, LogOut, Settings, User } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default function Header() {
	const currentUser = currentUserClient()

	if (!currentUser) return null

	const userImage = currentUser.image

	return (
		<header className="sticky top-0 z-30 h-16 border-b border-border bg-card">
			<div className="flex h-full items-center justify-between pl-14 sm:pl-16 lg:pl-6 pr-4 sm:pr-6 lg:pr-8">
				<div className="flex items-center">
					<h1 className="text-base font-semibold text-foreground hidden lg:block">Dashboard</h1>
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					<Button variant="ghost" size="icon" asChild className="hidden sm:flex">
						<Link href="/" title="Go to landing page">
							<Home className="h-5 w-5" />
						</Link>
					</Button>
					<ThemeToggle variant="switch" />
					<Button variant="ghost" size="icon" className="relative hidden sm:flex">
						<Bell className="h-5 w-5" />
						<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-10 w-10 rounded-full">
								<Avatar>
									<AvatarImage src={userImage || "/placeholder.svg"} alt={currentUser.name || "User"} />
									<AvatarFallback>
										{(currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || "U").toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium">{currentUser.name || "User"}</p>
									<p className="text-xs text-muted-foreground">{currentUser.email || ""}</p>
									<p className="text-xs text-primary font-medium mt-1">{getRoleLabel(currentUser.role || "CUSTOMER")}</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/profile" className="flex items-center cursor-pointer">
									<User className="mr-2 h-4 w-4" />
									My Profile
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings" className="flex items-center cursor-pointer">
									<Settings className="mr-2 h-4 w-4" />
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={async () => {
									await signOut({
										callbackUrl: "/",
										redirect: true,
									})
								}}
								className="text-destructive focus:text-destructive cursor-pointer"
							>
								<LogOut className="mr-2 h-4 w-4" />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
