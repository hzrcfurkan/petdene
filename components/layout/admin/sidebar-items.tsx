"use client"

import {
	LayoutDashboard, Users, Settings, User, Calendar,
	PawPrint, Sparkles, Syringe, Pill, FileText,
	Stethoscope, Upload, ClipboardList, BarChart3,
	CreditCard, Warehouse,
} from "lucide-react"

export interface NavItem {
	label: string
	href: string
	icon: React.ComponentType<{ className?: string }>
	roles?: string[]
}

export function getNavItems(role: string): NavItem[] {
	const baseItems: NavItem[] = [
		{ label: "Profil",  href: "/profile",  icon: User },
		{ label: "Ayarlar", href: "/settings", icon: Settings },
	]

	const dashboardLink = (() => {
		switch (role) {
			case "SUPER_ADMIN": return "/super"
			case "ADMIN":       return "/admin"
			case "DOCTOR":      return "/doctor"
			case "NURSE":       return "/nurse"
			case "CUSTOMER":    return "/customer"
			default:            return "/customer"
		}
	})()

	const items: NavItem[] = [
		{ label: "Panel", href: dashboardLink, icon: LayoutDashboard },
	]

	// SUPER_ADMIN
	if (role === "SUPER_ADMIN") {
		items.push({ label: "Kullanıcı Yönetimi", href: "/super/roles", icon: Users })
	}

	// ADMIN + SUPER_ADMIN — tüm menü
	if (role === "SUPER_ADMIN" || role === "ADMIN") {
		items.push({ label: "Ziyaretler",   href: "/admin/visits",         icon: ClipboardList })
		items.push({ label: "Randevular",   href: "/admin/appointments",   icon: Calendar })
		items.push({ label: "Hastalar",     href: "/admin/pets",           icon: PawPrint })
		items.push({ label: "Hizmetler",    href: "/admin/pet-services",   icon: Sparkles })
		items.push({ label: "Orderlar",     href: "/admin/orders",         icon: ClipboardList })
		items.push({ label: "Aşılar",       href: "/admin/vaccinations",   icon: Syringe })
		items.push({ label: "İçe Aktarma",  href: "/admin/imports",        icon: Upload })
		items.push({ label: "Reçeteler",    href: "/admin/prescriptions",  icon: Pill })
		items.push({ label: "Tıbbi Kayıtlar", href: "/admin/medical-records", icon: Stethoscope })
		items.push({ label: "Ödemeler",     href: "/admin/payments",       icon: CreditCard })
		items.push({ label: "Faturalar",    href: "/admin/invoices",       icon: FileText })
		items.push({ label: "Raporlar",     href: "/admin/reports",        icon: BarChart3 })
		items.push({ label: "Stoklar",      href: "/admin/stocks",         icon: Warehouse })
	}

	// DOKTOR — finansal raporlar yok
	if (role === "DOCTOR") {
		items.push({ label: "Ziyaretler",     href: "/admin/visits",            icon: ClipboardList })
		items.push({ label: "Randevular",     href: "/admin/appointments",      icon: Calendar })
		items.push({ label: "Hastalar",       href: "/admin/pets",              icon: PawPrint })
		items.push({ label: "Orderlar",       href: "/admin/orders",            icon: ClipboardList })
		items.push({ label: "Aşılar",         href: "/admin/vaccinations",      icon: Syringe })
		items.push({ label: "Reçeteler",      href: "/admin/prescriptions",     icon: Pill })
		items.push({ label: "Tıbbi Kayıtlar", href: "/admin/medical-records",   icon: Stethoscope })
		items.push({ label: "Ödemeler",       href: "/admin/payments",          icon: CreditCard })
		items.push({ label: "Faturalar",      href: "/admin/invoices",          icon: FileText })
		items.push({ label: "Stoklar",        href: "/admin/stocks",            icon: Warehouse })
	}

	// HEMŞİRE — finansal raporlar yok
	if (role === "NURSE") {
		items.push({ label: "Ziyaretler",     href: "/admin/visits",            icon: ClipboardList })
		items.push({ label: "Randevular",     href: "/admin/appointments",      icon: Calendar })
		items.push({ label: "Hastalar",       href: "/admin/pets",              icon: PawPrint })
		items.push({ label: "Orderlar",       href: "/admin/orders",            icon: ClipboardList })
		items.push({ label: "Aşılar",         href: "/admin/vaccinations",      icon: Syringe })
		items.push({ label: "Reçeteler",      href: "/admin/prescriptions",     icon: Pill })
		items.push({ label: "Tıbbi Kayıtlar", href: "/admin/medical-records",   icon: Stethoscope })
		items.push({ label: "Ödemeler",       href: "/admin/payments",          icon: CreditCard })
		items.push({ label: "Faturalar",      href: "/admin/invoices",          icon: FileText })
		items.push({ label: "Stoklar",        href: "/admin/stocks",            icon: Warehouse })
	}

	// MÜŞTERİ
	if (role === "CUSTOMER") {
		items.push({ label: "Hayvanlarım",    href: "/customer/pets",            icon: PawPrint })
		items.push({ label: "Ziyaretler",     href: "/customer/visits",          icon: ClipboardList })
		items.push({ label: "Randevular",     href: "/customer/appointments",    icon: Calendar })
		items.push({ label: "Tıbbi Kayıtlar", href: "/customer/medical-records", icon: Stethoscope })
		items.push({ label: "Aşılar",         href: "/customer/vaccinations",    icon: Syringe })
		items.push({ label: "Reçeteler",      href: "/customer/prescriptions",   icon: Pill })
		items.push({ label: "Faturalar",      href: "/customer/invoices",        icon: FileText })
	}

	items.push(...baseItems)
	return items
}
