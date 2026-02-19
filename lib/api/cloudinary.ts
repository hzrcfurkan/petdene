export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ""
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ""

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", CLOUDINARY_API_KEY)
  formData.append("timestamp", Math.floor(Date.now() / 1000).toString())

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Cloudinary error response:", errorData)
      throw new Error(`Upload failed: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error("[v0] Cloudinary upload error:", error)
    throw error
  }
}
