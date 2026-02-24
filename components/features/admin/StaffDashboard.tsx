"use client"

import { EnhancedStaffDashboard, DashboardManagementSection } from "@/components/features/dashboard"
import { AppointmentManagement } from "@/components/features/appointments/AppointmentManagement"
import { PetManagement } from "@/components/features/pets/PetManagement"
import { VaccinationManagement } from "@/components/features/vaccinations/VaccinationManagement"
import { PrescriptionManagement } from "@/components/features/prescriptions/PrescriptionManagement"
import { InvoiceManagement } from "@/components/features/invoices/InvoiceManagement"

export function StaffDashboard() {
	return (
		<div className="space-y-8">
			<EnhancedStaffDashboard />
			
			<div className="mt-8 space-y-8">
				<DashboardManagementSection title="Recent Appointments">
					<AppointmentManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Pet Management">
					<PetManagement />
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
