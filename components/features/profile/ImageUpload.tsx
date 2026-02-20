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
import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const CldUploadWidget = dynamic(
  () => import("next-cloudinary").then((mod) => mod.CldUploadWidget),
  { ssr: false }
)

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

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const cloudinaryFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER

  const cloudinaryEnabled = !!cloudName && !!uploadPreset

  const fetchImages = useCallback(async (cursor: string | null = null, isPrev = false) => {
    if (!cloudinaryEnabled) return
    setIsFetching(true)
    try {
      const res = await fetch(`/api/v1/cloudinary${cursor ? `?next_cursor=${cursor}` : ""}`)
      if (!res.ok) throw new Error("Failed to fetch images")
      const { images = [], nextCursor } = await res.json()
      setPreviousImages(
        images.sort(
          (a: Image, b: Image) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        )
      )
      setNextCursor(nextCursor || null)
      setPrevCursors((prev) =>
        isPrev ? prev.slice(0, -1) : cursor ? [...prev, cursor] : [null]
      )
    } catch (err) {
      toast.error("Failed to load images")
    } finally {
      setIsFetching(false)
    }
  }, [cloudinaryEnabled])

  useEffect(() => {
    if (cloudinaryEnabled) fetchImages()
  }, [fetchImages, cloudinaryEnabled])

  const handleImageUpload = useCallback(
    (result: any) => {
      if (result?.event === "success" && result?.info) {
        const newImage: Image = {
          secure_url: result.info.secure_url,
          public_id: result.info.public_id,
        }
        onChange(newImage.secure_url)
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

  if (!cloudinaryEnabled) {
    return (
      <div
        className="rounded-xl border border-gray-200 bg-muted flex items-center justify-center text-sm text-muted-foreground"
        style={{ height: imgHeight || "150px", width: imgWidth || "100%" }}
      >
        Image upload disabled
      </div>
    )
  }

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
                <AvatarImage
                  src={value}
                  alt="Image"
                  className="object-cover h-full w-full"
                />
                <AvatarFallback>Img</AvatarFallback>
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
    </div>
  )
}

export default ImageUpload
