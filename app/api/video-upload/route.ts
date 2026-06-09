import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getAuth } from "@clerk/nextjs/server"
import { prisma, withRetry } from "@/lib/prisma"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface CloudinaryUploadResult {
  public_id: string
  bytes: number
  duration?: number
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
    console.log("🔍 Auth check - userId:", userId)
    
    if (!userId) {
      return createErrorResponse("Unauthorized - Please sign in first", 401)
    }

    // Check Cloudinary credentials
    console.log("🔍 Checking Cloudinary credentials...")
    console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing")
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing")
    console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing")
    
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return createErrorResponse("Cloudinary credentials not configured", 500, "Missing environment variables")
    }

    // Check content-length header
    const contentLength = request.headers.get("content-length")
    console.log("📏 Content-Length:", contentLength, "bytes", contentLength ? `(${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)} MB)` : "(unknown)")
    
    // Parse form data with better error handling
    let formData
    try {
      console.log("🔄 Parsing FormData...")
      formData = await request.formData()
      console.log("✅ FormData parsed successfully")
    } catch (parseError: any) {
      console.error("❌ FormData parsing error:", parseError)
      console.error("Request headers:", {
        contentType: request.headers.get("content-type"),
        contentLength: request.headers.get("content-length"),
      })
      
      // Check if it's a size limit error
      if (parseError.message && parseError.message.includes('body')) {
        return createErrorResponse(
          "File too large for server", 
          413, 
          `Request body (${contentLength ? `${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)} MB` : 'unknown size'}) exceeds server limit. Maximum allowed is 100MB.`
        )
      }
      
      return createErrorResponse(
        "Failed to parse request", 
        400, 
        `FormData parsing failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      )
    }

    const file = formData.get("file")
    const rawTitle = formData.get("title")
    const rawDescription = formData.get("description")
    const rawOriginalSize = formData.get("originalSize")

    console.log("📁 File received:", file ? "Yes" : "No")
    
    if (!(file instanceof File)) {
      return createErrorResponse("No file provided", 400)
    }
    
    if (!file.type.startsWith("video/")) {
      return createErrorResponse("Invalid file type - only videos allowed", 400)
    }
    if (file.size > 80 * 1024 * 1024) {
      return createErrorResponse("File too large - max 80MB allowed", 400)
    }

    const title = typeof rawTitle === "string" ? rawTitle.trim() : ""
    const description = typeof rawDescription === "string" ? rawDescription.trim() : ""
    
    if (!title) {
      return createErrorResponse("Title is required", 400)
    }

    console.log("📹 Video details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      title: title
    })

    const parsedOriginalSize =
      typeof rawOriginalSize === "string" ? Number(rawOriginalSize) : Number.NaN
    const originalSize = Number.isFinite(parsedOriginalSize)
      ? parsedOriginalSize
      : file.size
    if (originalSize <= 0) {
      return createErrorResponse("Invalid file size", 400)
    }

    // Upload to Cloudinary
    console.log("☁️ Uploading to Cloudinary...")
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log("📦 Buffer created, size:", buffer.length, "bytes")

    // Try upload with compression first
    let result: CloudinaryUploadResult
    
    try {
      console.log("🔄 Attempt 1: Upload with auto compression...")
      result = await uploadToCloudinary(buffer, {
        resource_type: "video",
        folder: "video-uploads",
        quality: "auto",
        fetch_format: "mp4",
        // 2 minute timeout — handles slow connections without hanging forever.
        // The Cloudinary SDK passes this through to the underlying request.
        timeout: 120000,
      })
      console.log("✅ Upload with compression successful!")
    } catch (compressError: any) {
      console.log("⚠️ Compression upload failed, trying without compression...")
      console.log("   Error:", toErrorDetails(compressError))
      
      // Fallback: Upload without compression
      try {
        result = await uploadToCloudinary(buffer, {
          resource_type: "video",
          folder: "video-uploads",
          timeout: 120000,
        })
        console.log("✅ Upload without compression successful!")
      } catch (fallbackError: any) {
        console.error("❌ All upload attempts failed!")
        throw fallbackError
      }
    }

    console.log("📊 Upload result:", {
      public_id: result.public_id,
      bytes: result.bytes,
      duration: result.duration,
      format: result.format,
    })

    // Helper function for Cloudinary upload
    function uploadToCloudinary(buffer: Buffer, options: any): Promise<CloudinaryUploadResult> {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, uploadResult) => {
            if (error) {
              console.error("❌ Cloudinary upload error:", error)
              reject(error)
              return
            }
            if (!uploadResult) {
              console.error("❌ No upload result from Cloudinary")
              reject(new Error("No upload result"))
              return
            }
            resolve(uploadResult as CloudinaryUploadResult)
          }
        )
        
        uploadStream.on('error', (error: any) => {
          console.error("❌ Stream error:", error)
          reject(error)
        })
        
        uploadStream.end(buffer)
      })
    }

    // Log compression results after upload completes
    const originalMB = (file.size / (1024 * 1024)).toFixed(2)
    const compressedMB = (result.bytes / (1024 * 1024)).toFixed(2)
    const savings = result.bytes < file.size 
      ? ((1 - result.bytes / file.size) * 100).toFixed(1)
      : "0.0"
    const compressionRatio = result.bytes > 0 
      ? (file.size / result.bytes).toFixed(2)
      : "1.00"
    
    console.log(`📊 Compression Results:`)
    console.log(`   Original Size: ${originalMB} MB`)
    console.log(`   Compressed Size: ${compressedMB} MB`)
    console.log(`   Space Saved: ${savings}%`)
    console.log(`   Compression Ratio: ${compressionRatio}x`)
    console.log(`   Public ID: ${result.public_id}`)

    if (!result.public_id || typeof result.bytes !== "number") {
      throw new Error("Invalid upload response from Cloudinary")
    }

    // Save to database
    console.log("💾 Saving to database...")
    const duration = typeof result.duration === "number" ? result.duration : 0
    
    try {
      const video = await withRetry(
        () =>
          prisma.video.create({
            data: {
              title,
              description: description || null,
              publicId: result.public_id,
              originalSize,
              compressedSize: result.bytes,
              duration,
              userId,
            },
          }),
        { label: "videos.create", retries: 3, delayMs: 2000 }
      )
      
      console.log("✅ Video saved to database:", video.id)
      return NextResponse.json({
        success: true,
        video,
        message: "Video uploaded successfully!"
      }, { status: 201 })
    } catch (dbError: any) {
      console.error("❌ Database error:", dbError)
      console.error("Database error code:", dbError?.code)
      console.error("Database error meta:", dbError?.meta)
      return createErrorResponse(
        "Database error - video uploaded but not saved", 
        500, 
        `${dbError?.message || String(dbError)} (Code: ${dbError?.code || 'unknown'})`
      )
    }

  } catch (error: any) {
    console.error("❌ Upload video failed:", error)
    console.error("Error stack:", error?.stack)
    return createErrorResponse(
      "Upload failed", 
      500, 
      error instanceof Error ? error.message : String(error)
    )
  }
}
