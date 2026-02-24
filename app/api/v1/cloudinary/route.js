import { NextResponse } from "next/server"

export async function GET(request) {
	try {
		const cloudName = process.env.CLOUDINARY_CLOUD_NAME
		const apiKey = process.env.CLOUDINARY_API_KEY
		const apiSecret = process.env.CLOUDINARY_API_SECRET

		const { searchParams } = new URL(request.url)
		const nextCursor = searchParams.get("next_cursor") || ""
		const maxResults = 32 // 20 per page

		const cloudinaryFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER
		
		if (!cloudinaryFolder) {
			return NextResponse.json(
				{ error: "NEXT_PUBLIC_CLOUDINARY_FOLDER is not configured" },
				{ status: 500 }
			)
		}
		
		const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`)
		url.searchParams.append("prefix", `${cloudinaryFolder}/`)
		url.searchParams.append("max_results", maxResults)
		url.searchParams.append("direction", "desc") // newest first
		url.searchParams.append("sort_by", "created_at") // 👈 force sort by latest uploaded

		if (nextCursor) url.searchParams.append("next_cursor", nextCursor)

		const res = await fetch(url, {
			headers: {
				Authorization:
					"Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
			},
			cache: "no-store",
		})

		if (!res.ok) throw new Error("Failed to fetch images from Cloudinary")

		const data = await res.json()

		// Ensure sorting fallback in case Cloudinary ignores order
		const sortedImages = (data.resources || []).sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at)
		)

		return NextResponse.json({
			images: sortedImages,
			nextCursor: data.next_cursor || null,
		})
	} catch (err) {
		console.error("Cloudinary API Error:", err)
		return NextResponse.json(
			{ error: "Failed to load images" },
			{ status: 500 }
		)
	}
}


export async function DELETE(request) {
	try {
		const { publicIds } = await request.json()

		if (!Array.isArray(publicIds) || publicIds.length === 0) {
			return NextResponse.json({ error: "No public IDs provided" }, { status: 400 })
		}

		const cloudName = process.env.CLOUDINARY_CLOUD_NAME
		const apiKey = process.env.CLOUDINARY_API_KEY
		const apiSecret = process.env.CLOUDINARY_API_SECRET

		const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`

		const res = await fetch(url, {
			method: "DELETE",
			headers: {
				Authorization: "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ public_ids: publicIds }),
		})

		if (!res.ok) throw new Error("Failed to delete images from Cloudinary")

		return NextResponse.json({ success: true })
	} catch (err) {
		console.error("Cloudinary Delete Error:", err)
		return NextResponse.json({ error: "Failed to delete images" }, { status: 500 })
	}
}