import { Logo } from "@/components/shared/Logo"
import { BarChart3, CheckCircle, Database, Gauge, PawPrint, Shield, Star, Zap } from "lucide-react"
import Image from "next/image"

export default function PetCarePreviewCard({
	title = "Complete Professional Veterinary & Grooming Business Solution",
	landingImage = "/images/preview/1.png",
	cardBg = "/images/bg/3.jpg",
	features = [
		"Multi-role access control system",
		"Complete pet profile management",
		"Appointment scheduling and management",
		"Integrated billing and payment processing",
		"Medical records and prescription management",
	],
	tags = ["Next.js", "PostgreSQL", "Stripe", "Cloudinary", "NextAuth.js", "Tailwind CSS", "Radix UI", "Prisma"],
}) {
	const featureIcons = [CheckCircle, Star, Shield, Zap, BarChart3]

	return (
		<div className="flex flex-col items-center justify-center h-full space-y-5">
			<div
				className="relative w-[590px] h-[300px] overflow-hidden shadow-lg text-slate-50 backdrop-blur-sm"
				role="article"
				aria-label={title}
			>
				<Image
					src={cardBg || "/images/placeholder.svg"}
					alt="Card background"
					fill
					className="object-cover opacity-20"
					quality={100}
					priority
				/>

				<div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />
				<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/15 to-primary/10" />

				<div className="absolute -top-20 -left-20 w-56 h-56 bg-primary/20 rounded-full blur-3xl" />
				<div className="absolute -bottom-16 -right-24 w-64 h-64 bg-slate-600/15 rounded-full blur-3xl" />

				<div
					className="absolute inset-0 opacity-5"
					style={{
						backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
						backgroundSize: "20px 20px",
					}}
				/>

				<div className="absolute top-4 right-4 flex gap-1 z-10">
					<div className="px-3 py-1.5 text-white rounded-md text-xs font-semibold shadow-lg flex items-center">
						v1.0.0
					</div>
					<div className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-xs font-semibold shadow-lg flex items-center">
						Full Stack
					</div>
				</div>

				<div className="absolute bottom-2 left-2 flex gap-2 z-10">
					<div
						className="px-2 py-1 bg-primary/40 backdrop-blur-sm rounded-md text-xs text-white border border-primary/60 flex items-center shadow-sm"
					>
						<Database className="w-3 h-3 inline mr-1 text-primary/90" />
						99.9% Uptime
					</div>
					<div
						className="px-2 py-1 bg-teal-600/40 backdrop-blur-sm rounded-md text-xs text-teal-100 border border-teal-600/60 flex items-center shadow-sm"
					>
						<Gauge className="w-3 h-3 inline mr-1 text-teal-100" />
						50ms API
					</div>
				</div>

				<div className="relative grid grid-cols-12 h-full">
					<div className="col-span-5 relative overflow-hidden">
						<div className="relative h-full">
							<Image
								src={landingImage || "/placeholder.svg"}
								alt="Landing preview"
								fill
								className="object-cover object-center"
								priority
								quality={100}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
						</div>
					</div>


					<div className="col-span-7 px-6 py-2 flex flex-col justify-between">
						<div className="space-y-2">
							<div className="space-y-2">
								<Logo size="sm" textClassName="text-white" />
								<h4 className="text-md font-bold text-slate-50">
									{title}
								</h4>
							</div>

							<div className="space-y-1">
								{features.slice(0, 5).map((feature, i) => {
									const Icon = featureIcons[i] || CheckCircle
									return (
										<div key={i} className="flex items-start gap-3 group">
											<div className="flex-shrink-0 mt-0">
												<Icon className="w-4 h-4 text-white group-hover:text-primary/80 transition-colors duration-200" />
											</div>
											<p className="text-xs font-semibold text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-200">
												{feature}
											</p>
										</div>
									)
								})}
							</div>
						</div>

						<div className="pt-2 border-slate-700">
							<div className="flex flex-wrap gap-2 max-h-16 overflow-hidden">
								{tags.map((tag, idx) => {
									const colors = [
										"bg-primary/10 text-primary/05 border-primary/30",
										"bg-green-500/20 text-green-300 border-green-500/30",
										"bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
										"bg-pink-500/20 text-pink-300 border-pink-500/30",
										"bg-purple-500/20 text-purple-300 border-purple-500/30",
										"bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
										"bg-orange-500/20 text-orange-300 border-orange-500/30",
										"bg-red-500/20 text-red-300 border-red-500/30",
									]
									return (
										<span
											key={idx}
											className={`text-[10px] px-2 py-1 font-bold rounded-md border transition-all duration-200 cursor-default ${colors[idx % colors.length]} hover:brightness-110`}
										>
											{tag}
										</span>
									)
								})}
							</div>
						</div>
					</div>
				</div>

				<div className="absolute inset-0 border border-slate-700/50 pointer-events-none" />
			</div>

			<div
				className="relative w-[80px] h-[80px] flex flex-col items-center justify-center gap-1.5 shadow-lg text-slate-50 backdrop-blur-sm rounded-none bg-gradient-to-tr from-primary/60 via-primary/50 to-primary/40 transition-transform duration-300 hover:scale-105 cursor-pointer"
				role="article"
			>
				{/* Background glow */}
				<div className="absolute inset-0  bg-primary -z-10" />

				<div className="bg-primary flex items-center justify-center w-10 h-10 shadow-md relative overflow-hidden rounded-2xl">
					{/* Subtle gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent opacity-80 rounded-md" />

					<PawPrint className="relative w-5 h-5 text-white" />
				</div>

				<div className="text-xs font-semibold select-none leading-none text-center">
					Petcare
				</div>
			</div>
		</div>
	)
}
