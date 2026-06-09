import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getAuth } from "@clerk/nextjs/server"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface CloudinaryUploadResult {
  public_id: string
  [key: string]: unknown
}

// Coerce any value (string, Error, object) into a readable string.
// Cloudinary's SDK error objects have a `.message` field; everything else
// gets a sane JSON-stringify fallback so the client doesn't see "[object Object]".
const toErrorDetails = (value: unknown): string => {
  if (value === null || value === undefined) return "Unknown error"
  if (typeof value === "string") return value
  if (value instanceof Error) {
    const base = value.message || value.name || "Error"
    const cause =
      (value as { cause?: unknown }).cause !== undefined
        ? ` (cause: ${toErrorDetails((value as { cause?: unknown }).cause)})`
        : ""
    return `${base}${cause}`
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj.message === "string") {
      return typeof obj.http_code === "number"
        ? `${obj.message} (http ${obj.http_code})`
        : (obj.message as string)
    }
    try {
      return JSON.stringify(value)
    } catch {
      return "Unserialisable error"
    }
  }
  return String(value)
}

const createErrorResponse = (message: string, status: number, details?: unknown) => {
  return NextResponse.json({ 
    message, 
    details: details !== undefined ? toErrorDetails(details) : undefined,
    timestamp: new Date().toISOString()
  }, { status })
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using getAuth (doesn't consume body)
    const { userId } = getAuth(request)
    console.log("🔍 Image upload - Auth check - userId:", userId)
    
    if (!userId) {
      return createErrorResponse("Unauthorized - Please sign in first", 401)
    }

    // Check Cloudinary credentials
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return createErrorResponse("Cloudinary credentials not configured", 500, "Missing environment variables")
    }

    const formData = await request.formData()
    const file = formData.get("file")
    
    if (!(file instanceof File)) {
      return createErrorResponse("No file provided", 400)
    }
    
    if (!file.type.startsWith("image/")) {
      return createErrorResponse("Invalid file type - only images allowed", 400)
    }
    if (file.size > 15 * 1024 * 1024) {
      return createErrorResponse("File too large - max 15MB allowed", 400)
    }

    console.log("📷 Image details:", {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Upload to Cloudinary
    console.log("☁️ Uploading image to Cloudinary...")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "image-uploads",
            // 2 minute timeout — handles slow connections without hanging forever.
            // Cloudinary SDK passes this through to the underlying request.
            timeout: 120000,
          },
          (error, uploadResult) => {
            if (error) {
              console.error("❌ Cloudinary image upload error:", error)
              reject(error)
              return
            }
            if (!uploadResult) {
              console.error("❌ No upload result from Cloudinary")
              reject(new Error("No upload result"))
              return
            }
            console.log("✅ Cloudinary image upload success:", uploadResult.public_id)
            resolve(uploadResult as CloudinaryUploadResult)
          }
        )
        uploadStream.on("error", (err) => {
          console.error("❌ Image upload stream error:", err)
          reject(err)
        })
        uploadStream.end(buffer)
      }
    )

    if (!result.public_id) {
      throw new Error("Invalid upload response from Cloudinary")
    }

    console.log("✅ Image uploaded successfully!")
    return NextResponse.json(
      {
        success: true,
        publicId: result.public_id,
        public_id: result.public_id,
        message: "Image uploaded successfully!"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Upload image failed:", error)
    return createErrorResponse(
      "Image upload failed", 
      500, 
      error
    )
  }
}
