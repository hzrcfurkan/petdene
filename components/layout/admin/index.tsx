import Header from './header'
import Sidebar from './sidebar'

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ minHeight: '100dvh', background: 'var(--pc-bg)' }} className="lg:flex">
			<Sidebar />
			<div className="lg:pl-64 flex-1 flex flex-col min-w-0 overflow-x-hidden">
				<Header />
				<main className="flex-1 overflow-x-hidden p-6 lg:p-8">
					{children}
				</main>
			</div>
		</div>
	)
}
