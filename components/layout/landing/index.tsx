import Header from './header'
import Footer from './footer'

export default function LayoutLanding({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<main className="min-h-screen bg-background">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
					{children}
				</div>
			</main>
			<Footer />
		</>
	)
}
