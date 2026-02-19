import Header from './header'
import Sidebar from './sidebar'

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background lg:flex">
			<Sidebar />
			<div className="lg:pl-64 flex-1 flex flex-col min-w-0">
				<Header />
				<main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
					{children}
				</main>
			</div>
		</div>
	)
}
