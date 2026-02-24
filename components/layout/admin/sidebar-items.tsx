"use client"

import { LayoutDashboard, Users, Settings, User, Calendar, PawPrint, Sparkles, Syringe, Pill, FileText, Stethoscope, Upload } from "lucide-react"

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
			label: "Profile",
			href: "/profile",
			icon: User,
		},
		{
			label: "Settings",
			href: "/settings",
			icon: Settings,
		},
	]

	// Get dashboard link based on role
	const dashboardLink = (() => {
		switch (role) {
			case "SUPER_ADMIN":
				return "/admin/super"
			case "ADMIN":
				return "/admin"
			case "STAFF":
				return "/staff"
			case "CUSTOMER":
				return "/customer"
			default:
				return "/customer"
		}
	})()

	// Start with dashboard
	const items: NavItem[] = [
		{
			label: "Dashboard",
			href: dashboardLink,
			icon: LayoutDashboard,
		},
	]

	// Add role-specific admin items
	if (role === "SUPER_ADMIN" || role === "ADMIN") {
		items.push({
			label: "User Management",
			href: "/admin/roles",
			icon: Users,
		})
		items.push({
			label: "Appointments",
			href: "/admin/appointments",
			icon: Calendar,
		})
		items.push({
			label: "Pets",
			href: "/admin/pets",
			icon: PawPrint,
		})
		items.push({
			label: "Services",
			href: "/admin/pet-services",
			icon: Sparkles,
		})
		items.push({
			label: "Vaccinations",
			href: "/admin/vaccinations",
			icon: Syringe,
		})
		items.push({
			label: "Imports",
			href: "/admin/imports",
			icon: Upload,
		})
		items.push({
			label: "Prescriptions",
			href: "/admin/prescriptions",
			icon: Pill,
		})
		items.push({
			label: "Medical Records",
			href: "/admin/medical-records",
			icon: Stethoscope,
		})
		items.push({
			label: "Invoices",
			href: "/admin/invoices",
			icon: FileText,
		})
	}

	// Add appointments, pets, vaccinations, prescriptions, and invoices for staff
	if (role === "STAFF") {
		items.push({
			label: "Appointments",
			href: "/admin/appointments",
			icon: Calendar,
		})
		items.push({
			label: "Pets",
			href: "/admin/pets",
			icon: PawPrint,
		})
		items.push({
			label: "Vaccinations",
			href: "/admin/vaccinations",
			icon: Syringe,
		})
		items.push({
			label: "Prescriptions",
			href: "/admin/prescriptions",
			icon: Pill,
		})
		items.push({
			label: "Medical Records",
			href: "/admin/medical-records",
			icon: Stethoscope,
		})
		items.push({
			label: "Invoices",
			href: "/admin/invoices",
			icon: FileText,
		})
	}

	// Add pet care menus for customers (CUSTOMER role)
	if (role === "CUSTOMER") {
		items.push({
			label: "My Pets",
			href: "/customer/pets",
			icon: PawPrint,
		})
		items.push({
			label: "Appointments",
			href: "/customer/appointments",
			icon: Calendar,
		})
		items.push({
			label: "Medical Records",
			href: "/customer/medical-records",
			icon: Stethoscope,
		})
		items.push({
			label: "Vaccinations",
			href: "/customer/vaccinations",
			icon: Syringe,
		})
		items.push({
			label: "Prescriptions",
			href: "/customer/prescriptions",
			icon: Pill,
		})
		items.push({
			label: "Invoices",
			href: "/customer/invoices",
			icon: FileText,
		})
	}

	// Add base items
	items.push(...baseItems)

	return items
}

