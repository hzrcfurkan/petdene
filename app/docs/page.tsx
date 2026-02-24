import DocsLayout from "@/components/layout/docs"
import {
	PrerequisitesGuide,
	InstallationGuide,
	ConfigurationGuide,
	EnvironmentVariables,
	RunningTheApp,
	UsingTheApp,
	TroubleshootingGuide,
	NextStepsGuide,
} from "@/components/features/docs"

export default function DocsPage() {
	return (
		<DocsLayout>
			<PrerequisitesGuide />
			<InstallationGuide />
			<ConfigurationGuide />
			<EnvironmentVariables />
			<RunningTheApp />
			<UsingTheApp />
			<TroubleshootingGuide />
			<NextStepsGuide />
		</DocsLayout>
	)
}

