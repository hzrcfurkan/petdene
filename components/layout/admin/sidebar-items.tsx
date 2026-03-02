"use client"

import { LayoutDashboard, Users, Settings, User, Calendar, PawPrint, Sparkles, Syringe, Pill, FileText, Stethoscope, Upload, ClipboardList, BarChart3, CreditCard, Warehouse } from "lucide-react"

export interface NavItem {
	label: string
	href: string
	icon: React.ComponentType<{ className?: string }>
	roles?: string[]
}

/**
 * Get navigation items based on user role
 */
export function getNavItems(role: string): NavItem[] {
	// Base items for all users
	const baseItems: NavItem[] = [
		{
			label: "Profil",
			href: "/profile",
			icon: User,
		},
		{
			label: "Ayarlar",
			href: "/settings",
			icon: Settings,
		},
	]

	// Get dashboard link based on role
	const dashboardLink = (() => {
		switch (role) {
			case "Süper Admin":
				return "/super"
			case "Admin":
				return "/admin"
			case "Personel":
				return "/staff"
			case "Müşteri":
				return "/customer"
			default:
				return "/customer"
		}
	})()

	// Start with dashboard
	const items: NavItem[] = [
		{
			label: "Panel",
			href: dashboardLink,
			icon: LayoutDashboard,
		},
	]

	// Add role-specific admin items
	if (role === "SUPER_ADMIN") {
		items.push({
			label: "Kullanıcı Yönetimi",
			href: "/super/roles",
			icon: Users,
		})
	}
	if (role === "SUPER_ADMIN" || role === "ADMIN") {
		items.push({
			label: "Ziyaretler",
			href: "/admin/visits",
			icon: ClipboardList,
		})
		items.push({
			label: "Randevular",
			href: "/admin/appointments",
			icon: Calendar,
		})
		items.push({
			label: "Hastalar",
			href: "/admin/pets",
			icon: PawPrint,
		})
		items.push({
			label: "Hizmetler",
			href: "/admin/pet-services",
			icon: Sparkles,
		})
		items.push({
			label: "Aşılar",
			href: "/admin/vaccinations",
			icon: Syringe,
		})
		items.push({
			label: "İçe Aktarma",
			href: "/admin/imports",
			icon: Upload,
		})
		items.push({
			label: "Reçeteler",
			href: "/admin/prescriptions",
			icon: Pill,
		})
		items.push({
			label: "Tıbbi Kayıtlar",
			href: "/admin/medical-records",
			icon: Stethoscope,
		})
		items.push({
			label: "Ödemeler",
			href: "/admin/payments",
			icon: CreditCard,
		})
		items.push({
			label: "Faturalar",
			href: "/admin/invoices",
			icon: FileText,
		})
		items.push({
			label: "Raporlar",
			href: "/admin/reports",
			icon: BarChart3,
		})
		items.push({
			label: "Stoklar",
			href: "/admin/stocks",
			icon: Warehouse,
		})
	}

	// Add appointments, pets, vaccinations, prescriptions, and invoices for staff
	if (role === "STAFF") {
		items.push({
			label: "Ziyaretler",
			href: "/admin/visits",
			icon: ClipboardList,
		})
		items.push({
			label: "Randevular",
			href: "/admin/appointments",
			icon: Calendar,
		})
		items.push({
			label: "Hastalar",
			href: "/admin/pets",
			icon: PawPrint,
		})
		items.push({
			label: "Aşılar",
			href: "/admin/vaccinations",
			icon: Syringe,
		})
		items.push({
			label: "Reçeteler",
			href: "/admin/prescriptions",
			icon: Pill,
		})
		items.push({
			label: "Tıbbi Kayıtlar",
			href: "/admin/medical-records",
			icon: Stethoscope,
		})
		items.push({
			label: "Ödemeler",
			href: "/admin/payments",
			icon: CreditCard,
		})
		items.push({
			label: "Faturalar",
			href: "/admin/invoices",
			icon: FileText,
		})
		items.push({
			label: "Raporlar",
			href: "/admin/reports",
			icon: BarChart3,
		})
		items.push({
			label: "Stoklar",
			href: "/admin/stocks",
			icon: Warehouse,
		})
	}

	// Add pet care menus for customers (CUSTOMER role)
	if (role === "CUSTOMER") {
		items.push({
			label: "Hayvanlarım",
			href: "/customer/pets",
			icon: PawPrint,
		})
		items.push({
			label: "Ziyaretler",
			href: "/customer/visits",
			icon: ClipboardList,
		})
		items.push({
			label: "Randevular",
			href: "/customer/appointments",
			icon: Calendar,
		})
		items.push({
			label: "Tıbbi Kayıtlar",
			href: "/customer/medical-records",
			icon: Stethoscope,
		})
		items.push({
			label: "Aşılar",
			href: "/customer/vaccinations",
			icon: Syringe,
		})
		items.push({
			label: "Reçeteler",
			href: "/customer/prescriptions",
			icon: Pill,
		})
		items.push({
			label: "Faturalar",
			href: "/customer/invoices",
			icon: FileText,
		})
	}

	// Add base items
	items.push(...baseItems)

	return items
}

