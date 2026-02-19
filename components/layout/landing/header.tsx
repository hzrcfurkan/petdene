import { Logo } from "@/components/shared/Logo"
import { HeaderActions } from "./header-actions"

export default async function Header() {
	return (
		<>
			<header className="border-b border-border bg-card">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Logo href="/" />
						<HeaderActions />
					</div>
				</div>
			</header>
		</>
	)
}
