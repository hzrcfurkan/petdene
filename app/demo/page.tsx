import LayoutLanding from "@/components/layout/landing"
import {
	DemoHero,
	UserTestLoginInfo,
	HowItWorks,
	WhyChoosePetcare,
	KeyFeatures,
	HowToTest,
} from "@/components/features/demo"

export default function DemoPage() {
	return (
		<LayoutLanding>
			<DemoHero />
			<UserTestLoginInfo />
			<HowItWorks />
			<WhyChoosePetcare />
			<KeyFeatures />
			<HowToTest />
		</LayoutLanding>
	)
}

