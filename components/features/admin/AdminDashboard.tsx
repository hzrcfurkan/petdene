"use client"

import { usePathname } from "next/navigation"
import { EnhancedAdminDashboard, DashboardManagementSection } from "@/components/features/dashboard"
import { AppointmentManagement } from "@/components/features/appointments/AppointmentManagement"
import { PetManagement } from "@/components/features/pets/PetManagement"
import { PetServiceManagement } from "@/components/features/pet-services/PetServiceManagement"
import { VaccinationManagement } from "@/components/features/vaccinations/VaccinationManagement"
import { PrescriptionManagement } from "@/components/features/prescriptions/PrescriptionManagement"
import { InvoiceManagement } from "@/components/features/invoices/InvoiceManagement"

export function AdminDashboard() {
	const pathname = usePathname()

	if (pathname !== "/admin") {
		return null
	}

	return (
		<div className="space-y-8">
			<EnhancedAdminDashboard />
			
			<div className="mt-8 space-y-8">
				<DashboardManagementSection title="Recent Appointments">
					<AppointmentManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Pet Management">
					<PetManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Service Management">
					<PetServiceManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Vaccination Management">
					<VaccinationManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Prescription Management">
					<PrescriptionManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Invoice Management">
					<InvoiceManagement />
				</DashboardManagementSection>
			</div>
		</div>
	)
}
