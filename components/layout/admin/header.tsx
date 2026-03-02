"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { currentUserClient, getRoleLabel } from "@/lib/auth/client"
import { Bell, Home, LogOut, Settings, User, Search } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

function getBreadcrumb(pathname: string): string {
	const segments: Record<string, string> = {
		"admin": "Yönetim",
		"customer": "Müşteri",
		"staff": "Personel",
		"super": "Süper Admin",
		"dashboard": "Panel",
		"visits": "Ziyaretler",
		"appointments": "Randevular",
		"pets": "Hastalar",
		"vaccinations": "Aşılar",
		"prescriptions": "Reçeteler",
		"medical-records": "Tıbbi Kayıtlar",
		"invoices": "Faturalar",
		"payments": "Ödemeler",
		"reports": "Raporlar",
		"pet-services": "Hizmetler",
		"profile": "Profil",
		"settings": "Ayarlar",
		"imports": "İçe Aktar",
	}
	const parts = pathname.split("/").filter(Boolean)
	return parts.map(p => segments[p] || p).join(" / ")
}

export default function Header() {
	const currentUser = currentUserClient()
	const pathname = usePathname()

	if (!currentUser) return null

	const initials = (currentUser.name || currentUser.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
	const breadcrumb = getBreadcrumb(pathname)

	return (
		<header className="hd-bar">
			<div className="hd-inner">
				<div className="hd-left">
					<div className="hd-breadcrumb">{breadcrumb || "Panel"}</div>
				</div>

				<div className="hd-search-wrap">
					<Search className="hd-search-icon" />
					<input className="hd-search" placeholder="Ara — hasta, randevu, fatura..." />
				</div>

				<div className="hd-right">
					<Link href="/" className="hd-icon-btn" title="Ana Sayfa">
						<Home className="w-4 h-4" />
					</Link>

					<ThemeToggle variant="switch" />

					<button className="hd-icon-btn hd-bell">
						<Bell className="w-4 h-4" />
						<span className="hd-bell-dot" />
					</button>

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
							<DropdownMenuItem asChild>
								<Link href="/profile" className="hd-dd-item"><User className="w-4 h-4" />Profilim</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings" className="hd-dd-item"><Settings className="w-4 h-4" />Ayarlar</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={async () => { await signOut({ callbackUrl: "/", redirect: true }) }}
								className="hd-dd-logout"
							>
								<LogOut className="w-4 h-4" />Çıkış Yap
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
