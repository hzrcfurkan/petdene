"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Trash2, Upload, ImageOff } from "lucide-react"
import { useCallback } from "react"
import { toast } from "sonner"

interface ImageUploadProps {
	onChange: (url: string) => void
	value?: string
	showReuse?: boolean
	imgHeight?: number | string
	imgWidth?: number | string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	onChange,
	value,
	imgHeight,
	imgWidth,
}) => {
	const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
	const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
	const folder       = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER
	const hasCloudinary = !!(cloudName && uploadPreset)

	const handleClearImage = useCallback(() => {
		onChange("")
		toast("Fotoğraf kaldırıldı.")
	}, [onChange])

	const openUploadWidget = useCallback(() => {
		if (!hasCloudinary) {
			toast.warning("Fotoğraf yükleme aktif değil. Cloudinary ayarları eksik.")
			return
		}
		// Cloudinary Upload Widget'ı doğrudan script tag ile yükle
		const script = document.createElement("script")
		script.src = "https://upload-widget.cloudinary.com/global/all.js"
		script.onload = () => {
			;(window as any).cloudinary
				.openUploadWidget(
					{
						cloudName,
						uploadPreset,
						folder: folder || "petcare",
						maxFiles: 1,
						sources: ["local", "camera"],
					},
					(error: any, result: any) => {
						if (!error && result?.event === "success") {
							onChange(result.info.secure_url)
							toast.success("Fotoğraf yüklendi!")
						}
					}
				)
		}
		// Zaten yüklüyse direkt aç
		if ((window as any).cloudinary) {
			script.onload?.(new Event("load"))
		} else {
			document.body.appendChild(script)
		}
	}, [hasCloudinary, cloudName, uploadPreset, folder, onChange])

	return (
		<div className="space-y-3">
			<div
				className={cn(
					"rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all flex items-center justify-center relative overflow-hidden",
					value && "border-solid border-gray-200",
					hasCloudinary && "cursor-pointer hover:border-blue-400 hover:bg-blue-50/30"
				)}
				style={{ height: imgHeight || "150px", width: imgWidth || "100%" }}
				onClick={openUploadWidget}
			>
				{value ? (
					<Avatar
						style={{ height: imgHeight || "150px", width: imgWidth || "100%" }}
						className="rounded-xl overflow-hidden"
					>
						<AvatarImage src={value} alt="Yüklenen fotoğraf" className="object-cover h-full w-full" />
						<AvatarFallback>Img</AvatarFallback>
					</Avatar>
				) : hasCloudinary ? (
					<div className="flex flex-col items-center justify-center text-gray-400 gap-2">
						<Upload className="w-8 h-8" />
						<span className="text-xs">Fotoğraf yüklemek için tıkla</span>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center text-gray-300 gap-2 pointer-events-none">
						<ImageOff className="w-7 h-7" />
						<span className="text-xs text-center px-4 text-gray-400">Fotoğraf yükleme devre dışı</span>
					</div>
				)}
			</div>

			{value && (
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={(e) => { e.stopPropagation(); handleClearImage() }}
					className="flex items-center gap-2"
				>
					<Trash2 className="w-4 h-4" /> Kaldır
				</Button>
			)}
		</div>
	)
}

export default ImageUpload
