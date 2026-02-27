import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Petcare - Veterinary & Grooming Business",
		short_name: "Petcare",
		description: "Complete Professional Veterinary & Grooming Business Solution",
		start_url: "/",
		display: "standalone",
		background_color: "#f8fafc",
		theme_color: "#155DFC",
		orientation: "portrait-primary",
		scope: "/",
		icons: [
			{
				src: "/icon.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "any",
			},
			{
				src: "/icon.svg",
				sizes: "512x512",
				type: "image/svg+xml",
				purpose: "maskable",
			},
		],
		categories: ["business", "productivity"],
	}
}
