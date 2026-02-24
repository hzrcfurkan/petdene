import Link from "next/link"
import { Logo } from "@/components/shared/Logo"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
	return (
		<footer className="border-t border-border bg-card">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{/* Brand Column */}
					<div className="space-y-4">
						<Logo href="/" />
						<p className="text-sm text-muted-foreground">
							Complete pet care management solution. Keep your furry friends healthy and happy.
						</p>
						<div className="flex gap-4">
							<a
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
								aria-label="Facebook"
							>
								<Facebook className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
								aria-label="Twitter"
							>
								<Twitter className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
								aria-label="Instagram"
							>
								<Instagram className="h-5 w-5" />
							</a>
						</div>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Quick Links</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="/signup" className="text-muted-foreground hover:text-primary transition-colors">
									Get Started
								</Link>
							</li>
							<li>
								<Link href="/signin" className="text-muted-foreground hover:text-primary transition-colors">
									Sign In
								</Link>
							</li>
							<li>
								<a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
									Features
								</a>
							</li>
							<li>
								<a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
									Services
								</a>
							</li>
						</ul>
					</div>

					{/* Features */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Features</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
									Pet Management
								</a>
							</li>
							<li>
								<a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
									Appointments
								</a>
							</li>
							<li>
								<a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
									Medical Records
								</a>
							</li>
							<li>
								<a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
									Vaccinations
								</a>
							</li>
						</ul>
					</div>

					{/* Contact */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Contact Us</h3>
						<ul className="space-y-3 text-sm">
							<li className="flex items-start gap-2 text-muted-foreground">
								<Mail className="h-4 w-4 mt-0.5 shrink-0" />
								<a href="mailto:support@petcare.com" className="hover:text-primary transition-colors">
									support@petcare.com
								</a>
							</li>
							<li className="flex items-start gap-2 text-muted-foreground">
								<Phone className="h-4 w-4 mt-0.5 shrink-0" />
								<a href="tel:+1234567890" className="hover:text-primary transition-colors">
									+1 (234) 567-890
								</a>
							</li>
							<li className="flex items-start gap-2 text-muted-foreground">
								<MapPin className="h-4 w-4 mt-0.5 shrink-0" />
								<span>123 Pet Care St, City, State 12345</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 pt-8 border-t border-border">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
						<p>© {new Date().getFullYear()} Pet Care. All rights reserved.</p>
						<div className="flex gap-6">
							<Link href="#" className="hover:text-primary transition-colors">
								Privacy Policy
							</Link>
							<Link href="#" className="hover:text-primary transition-colors">
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

