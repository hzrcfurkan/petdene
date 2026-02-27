"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, History, Trash2, Upload } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface Image {
	secure_url: string
	public_id: string
	created_at?: string
}

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
	showReuse = true,
	imgHeight,
	imgWidth,
}) => {
	const [previousImages, setPreviousImages] = useState<Image[]>([])
	const [selectedImages, setSelectedImages] = useState<string[]>([])
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isFetching, setIsFetching] = useState(false)
	const [nextCursor, setNextCursor] = useState<string | null>(null)
	const [prevCursors, setPrevCursors] = useState<(string | null)[]>([null])

	const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
	const cloudinaryFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER

	if (!uploadPreset) {
		console.error("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set in environment variables")
	}
	if (!cloudinaryFolder) {
		console.error("NEXT_PUBLIC_CLOUDINARY_FOLDER is not set in environment variables")
	}

	const fetchImages = useCallback(async (cursor: string | null = null, isPrev = false) => {
		setIsFetching(true)
		try {
			const res = await fetch(`/api/v1/cloudinary${cursor ? `?next_cursor=${cursor}` : ""}`)
			if (!res.ok) throw new Error("Failed to fetch images")
			const { images = [], nextCursor } = await res.json()
			setPreviousImages(
				images.sort((a: Image, b: Image) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
			)
			setNextCursor(nextCursor || null)
			setPrevCursors((prev) => (isPrev ? prev.slice(0, -1) : cursor ? [...prev, cursor] : [null]))
		} catch (err) {
			console.error(err)
			toast.error("Failed to load images")
			setPreviousImages([])
			setNextCursor(null)
		} finally {
			setIsFetching(false)
		}
	}, [])

	const handleImageUpload = useCallback(
		(result: any) => {
			if (result?.event === "success" && result?.info) {
				const newImage: Image = {
					secure_url: result.info.secure_url,
					public_id: result.info.public_id
				}
				onChange(newImage.secure_url)
				setPreviousImages((prev) => [newImage, ...prev.filter((img) => img.secure_url !== newImage.secure_url)])
				toast.success("Image uploaded successfully!")
			} else if (result?.event === "error") {
				toast.error("Upload failed")
			}
		},
		[onChange]
	)

	const handleClearImage = useCallback(() => {
		onChange("")
		toast("Image removed.")
	}, [onChange])

	const handleReuseImage = useCallback(
		(image: Image) => {
			onChange(image.secure_url)
			setIsDialogOpen(false)
			toast.success("Image selected!")
		},
		[onChange]
	)

	const toggleSelectImage = (publicId: string) =>
		setSelectedImages((prev) =>
			prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
		)

	const toggleSelectAll = () =>
		setSelectedImages(
			selectedImages.length === previousImages.length ? [] : previousImages.map((img) => img.public_id)
		)

	const handleDeleteImages = async (ids: string[]) => {
		try {
			const res = await fetch("/api/v1/cloudinary", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ publicIds: ids }),
			})
			if (!res.ok) throw new Error("Delete failed")
			setPreviousImages((prev) => prev.filter((img) => !ids.includes(img.public_id)))
			setSelectedImages((prev) => prev.filter((id) => !ids.includes(id)))
			toast.success(`${ids.length} image(s) deleted.`)
		} catch (err) {
			console.error(err)
			toast.error("Delete failed")
		}
	}

	useEffect(() => {
		fetchImages()
	}, [fetchImages])

	return (
		<div className="space-y-4">
			<CldUploadWidget
				onSuccess={handleImageUpload}
				uploadPreset={uploadPreset}
				options={{ maxFiles: 1, folder: cloudinaryFolder }}
			>
				{({ open }) => (
					<div
						onClick={() => open?.()}
						className={cn(
							"rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer transition-all flex items-center justify-center relative",
							value && "border-solid border-gray-200"
						)}
						style={{ height: imgHeight || "150px", width: imgWidth || "100%" }}
					>
						{value ? (
							<Avatar
								style={{ height: imgHeight || "150px", width: imgWidth || "100%" }}
								className="rounded-xl overflow-hidden"
							>
								<AvatarImage src={value} alt="Job Image" className="object-cover h-full w-full" />
							</Avatar>
						) : (
							<div className="flex flex-col items-center justify-center text-gray-500">
								<Upload className="w-8 h-8" />
								<span className="text-xs mt-1">Click to Upload</span>
							</div>
						)}
					</div>
				)}
			</CldUploadWidget>

			<div className="flex flex-row gap-2" style={{ width: imgWidth || "100%" }}>
				{value && (
					<Button
						variant="destructive"
						size="sm"
						onClick={handleClearImage}
						className="flex items-center gap-2"
					>
						<Trash2 className="w-4 h-4" /> Remove
					</Button>
				)}
				{showReuse && (
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm" className="flex items-center gap-2">
								<History className="w-4 h-4" /> Gallery
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[700px] p-4 bg-white dark:bg-gray-800 rounded-xl">
							<DialogHeader className="flex flex-col gap-2">
								<DialogTitle>Gallery</DialogTitle>
							</DialogHeader>
							{isFetching ? (
								<div className="flex justify-center items-center h-40">
									<div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
								</div>
							) : previousImages.length === 0 ? (
								<div className="text-center text-gray-500 py-8">No images uploaded yet.</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2">
									{previousImages.map((image, index) => (
										<div
											key={image.public_id}
											className="relative rounded-lg overflow-hidden group shadow-sm hover:shadow-lg transition border border-gray-200 dark:border-gray-600"
											style={{ height: imgHeight || "140px", width: imgWidth || "auto" }}
										>
											<input
												type="checkbox"
												checked={selectedImages.includes(image.public_id)}
												onChange={() => toggleSelectImage(image.public_id)}
												className="absolute top-2 left-2 z-10 w-4 h-4"
											/>
											<Avatar
												style={{ height: imgHeight || "140px", width: imgWidth || "auto" }}
												className="rounded-lg overflow-hidden"
											>
												<AvatarImage
													src={image.secure_url}
													alt={`Image ${index + 1}`}
													className="object-cover h-full w-full"
												/>
												<AvatarFallback>Img</AvatarFallback>
											</Avatar>
											<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
												<Button
													variant="secondary"
													size="sm"
													className="text-white bg-blue-500 hover:bg-blue-600"
													onClick={() => handleReuseImage(image)}
												>
													Select
												</Button>
											</div>
											<button
												onClick={() => handleDeleteImages([image.public_id])}
												className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									))}
								</div>
							)}
							<div className="flex justify-between items-center gap-4 mt-4">
								<div className="flex items-center gap-2">
									{previousImages.length > 0 && (
										<label className="flex items-center gap-1 text-sm cursor-pointer">
											<input
												type="checkbox"
												checked={selectedImages.length === previousImages.length}
												onChange={toggleSelectAll}
											/>
											Select All
										</label>
									)}
									{selectedImages.length > 0 && (
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteImages(selectedImages)}
										>
											Delete ({selectedImages.length})
										</Button>
									)}
								</div>
								<div className="flex gap-4">
									<Button
										variant="outline"
										size="sm"
										disabled={prevCursors.length <= 1 || isFetching}
										onClick={() => fetchImages(prevCursors[prevCursors.length - 2], true)}
									>
										<ChevronLeft className="w-4 h-4" /> Prev
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={!nextCursor || isFetching}
										onClick={() => fetchImages(nextCursor)}
									>
										Next <ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</div>
	)
}

export default ImageUpload
