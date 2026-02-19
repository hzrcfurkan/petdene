import { DocsSidebar } from "./DocsSidebar"
import Footer from "../landing/footer"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<DocsSidebar />
			<div className="lg:pl-64 flex-1 flex flex-col min-w-0">
				<main className="flex-1">
					<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
						{children}
					</div>
				</main>
				<Footer />
			</div>
		</div>
	)
}

