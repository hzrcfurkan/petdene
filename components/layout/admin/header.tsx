"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { currentUserClient, getRoleLabel } from "@/lib/auth/client"
import { Bell, Home, LogOut, Settings, User, Search, X, PawPrint } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useState, useEffect, useRef } from "react"
import { usePets } from "@/lib/react-query/hooks/pets"

// --- Typewriter placeholder hook ---
const PLACEHOLDERS = [
	"Hasta ara...",
	"Randevu ara...",
	"Fatura ara...",
	"Hasta adı veya no girin...",
]

function useTypewriter(strings: string[], speed = 65, pause = 1600) {
	const [display, setDisplay] = useState("")
	const [cursor, setCursor] = useState(true)
	const [strIdx, setStrIdx] = useState(0)
	const [charIdx, setCharIdx] = useState(0)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		const id = setInterval(() => setCursor(c => !c), 500)
		return () => clearInterval(id)
	}, [])

	useEffect(() => {
		const current = strings[strIdx]
		if (!deleting && charIdx < current.length) {
			const id = setTimeout(() => { setDisplay(current.slice(0, charIdx + 1)); setCharIdx(i => i + 1) }, speed)
			return () => clearTimeout(id)
		}
		if (!deleting && charIdx === current.length) {
			const id = setTimeout(() => setDeleting(true), pause)
			return () => clearTimeout(id)
		}
		if (deleting && charIdx > 0) {
			const id = setTimeout(() => { setDisplay(current.slice(0, charIdx - 1)); setCharIdx(i => i - 1) }, speed / 2)
			return () => clearTimeout(id)
		}
		if (deleting && charIdx === 0) { setDeleting(false); setStrIdx(i => (i + 1) % strings.length) }
	}, [charIdx, deleting, strIdx, strings, speed, pause])

	return { display, cursor }
}

// --- Arama sonuçları dropdown ---
function SearchResults({ query, onSelect, role }: { query: string; onSelect: () => void; role: string | undefined }) {
	const { data, isLoading } = usePets({ search: query, limit: 6 })
	const pets = data?.pets || []
	const basePath = (role === "ADMIN" || role === "SUPER_ADMIN" || role === "DOCTOR" || role === "NURSE" || role === "STAFF") ? "/admin/pets" : "/customer/pets"

	if (!query.trim()) return null

	return (
		<div className="hd-results">
			{isLoading ? (
				<div className="hd-results-empty">Aranıyor...</div>
			) : pets.length === 0 ? (
				<div className="hd-results-empty">Sonuç bulunamadı</div>
			) : (
				<>
					<div className="hd-results-label">Hastalar</div>
					{pets.map(pet => (
						<Link key={pet.id} href={`${basePath}/${pet.id}`} className="hd-result-item" onClick={onSelect}>
							<span className="hd-result-icon"><PawPrint className="w-3.5 h-3.5" /></span>
							<span className="hd-result-info">
								<span className="hd-result-name">{pet.name}</span>
								<span className="hd-result-meta">
									{pet.patientNumber && `#${pet.patientNumber} · `}{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}{pet.owner?.name ? ` · ${pet.owner.name}` : ""}
								</span>
							</span>
						</Link>
					))}
				</>
			)}
		</div>
	)
}

function getBreadcrumb(pathname: string): string {
	const segments: Record<string, string> = {
		"admin": "Yönetim", "customer": "Müşteri", "staff": "Hemşire", "doctor": "Doktor", "nurse": "Hemşire", "super": "Süper Admin",
		"visits": "Ziyaretler", "appointments": "Randevular", "pets": "Hastalar",
		"vaccinations": "Aşılar", "prescriptions": "Reçeteler", "medical-records": "Tıbbi Kayıtlar",
		"invoices": "Faturalar", "payments": "Ödemeler", "reports": "Raporlar",
		"pet-services": "Hizmetler", "profile": "Profil", "settings": "Ayarlar",
		"imports": "İçe Aktar", "stocks": "Stoklar",
	}
	const parts = pathname.split("/").filter(Boolean)
	return parts.map(p => segments[p] || p).join(" / ")
}

export default function Header() {
	const currentUser = currentUserClient()
	const pathname = usePathname()
	const router = useRouter()

	const [query, setQuery] = useState("")
	const [focused, setFocused] = useState(false)
	const wrapRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const { display: twText, cursor: twCursor } = useTypewriter(PLACEHOLDERS)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false)
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && query.trim()) {
			const base = (currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "DOCTOR" || currentUser?.role === "NURSE" || currentUser?.role === "STAFF") ? "/admin/pets" : "/customer/pets"
			router.push(`${base}?search=${encodeURIComponent(query.trim())}`)
			setFocused(false); setQuery("")
		}
		if (e.key === "Escape") { setFocused(false); setQuery(""); inputRef.current?.blur() }
	}

	if (!currentUser) return null

	const initials = (currentUser.name || currentUser.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
	const breadcrumb = getBreadcrumb(pathname)

	return (
		<header className="hd-bar">
			<div className="hd-inner">
				<div className="hd-left">
					<div className="hd-breadcrumb">{breadcrumb || "Panel"}</div>
				</div>

				<div className="hd-search-wrap" ref={wrapRef}>
					<Search className="hd-search-icon" />
					<input
						ref={inputRef}
						className="hd-search"
						value={query}
						onChange={e => setQuery(e.target.value)}
						onFocus={() => setFocused(true)}
						onKeyDown={handleKeyDown}
						placeholder=""
					/>
					{!query && !focused && (
						<span className="hd-tw-placeholder" aria-hidden>
							{twText}<span className={`hd-tw-cursor${twCursor ? " hd-tw-cursor-on" : ""}`}>|</span>
						</span>
					)}
					{query && (
						<button className="hd-search-clear" onClick={() => { setQuery(""); inputRef.current?.focus() }}>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
					{focused && query.trim().length > 0 && (
						<SearchResults query={query} onSelect={() => { setFocused(false); setQuery("") }} role={currentUser.role} />
					)}
				</div>

				<div className="hd-right">
					<Link href="/" className="hd-icon-btn" title="Ana Sayfa"><Home className="w-4 h-4" /></Link>
					<ThemeToggle variant="switch" />
					<button className="hd-icon-btn hd-bell"><Bell className="w-4 h-4" /><span className="hd-bell-dot" /></button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="hd-avatar-btn">
								<Avatar className="w-8 h-8">
									<AvatarImage src={currentUser.image || ""} alt={currentUser.name || "User"} />
									<AvatarFallback className="hd-avatar-fallback">{initials}</AvatarFallback>
								</Avatar>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="hd-dropdown">
							<DropdownMenuLabel>
								<p className="hd-dd-name">{currentUser.name || "Kullanıcı"}</p>
								<p className="hd-dd-email">{currentUser.email}</p>
								<p className="hd-dd-role">{getRoleLabel(currentUser.role || "Müşteri")}</p>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild><Link href="/profile" className="hd-dd-item"><User className="w-4 h-4" />Profilim</Link></DropdownMenuItem>
							<DropdownMenuItem asChild><Link href="/settings" className="hd-dd-item"><Settings className="w-4 h-4" />Ayarlar</Link></DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={async () => { await signOut({ callbackUrl: "/", redirect: true }) }} className="hd-dd-logout">
								<LogOut className="w-4 h-4" />Çıkış Yap
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
