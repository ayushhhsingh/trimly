"use client"

import React, { useState } from "react"
import { CldImage } from "next-cloudinary"

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
  // LinkedIn personal banner: 4:1 aspect ratio. Cloudinary's CldImage with
  // crop="fill" + aspectRatio="4:1" auto-crops the uploaded image to fit
  // the banner dimensions while preserving the focal point.
  "LinkedIn Banner (4:1)": { width: 1584, height: 396, aspectRatio: "4:1" },
}

type SocialFormat = keyof typeof socialFormats

interface ImageUploadResponse {
  publicId?: string
  public_id?: string
  message?: string
  error?: string
  details?: string
}

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
    "Instagram Square (1:1)"
  )
  const [isUploading, setIsUploading] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("📷 Starting image upload...")
    setErrorMessage(null)
    setUploadedImage(null)
    setDownloadUrl(null)
    setIsTransforming(false)
    setIsUploading(true)

    // Check file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file (JPG, PNG, GIF, etc.)")
      setIsUploading(false)
      return
    }

    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 15MB.")
      setIsUploading(false)
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      console.log("📤 Uploading to /api/image-upload...")
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      })
      
      const data = (await response.json()) as ImageUploadResponse
      
      console.log("📨 Response:", {
        status: response.status,
        ok: response.ok,
        data: data
      })
      
      if (!response.ok) {
        // Build a readable error message without assuming data.details is a string.
        // The server's error response has the shape:
        //   { message: string, details?: string, timestamp?: string }
        // but axios error responses can come back as anything, so we coerce safely.
        const message =
          (typeof data?.message === "string" && data.message) ||
          (typeof data?.error?.message === "string" && data.error.message) ||
          (typeof data?.error === "string" && data.error) ||
          (typeof data === "string" && data) ||
          `Upload failed with status ${response.status}`
        const detail =
          typeof data?.details === "string" ? data.details : undefined
        const errorMsg = detail ? `${message} - ${detail}` : message
        console.error("❌ Upload failed:", errorMsg)
        throw new Error(errorMsg)
      }

      const publicId = data.publicId ?? data.public_id
      if (!publicId) {
        throw new Error(
          "Image upload succeeded but no public ID was returned."
        )
      }

      console.log("✅ Image uploaded successfully:", publicId)
      setUploadedImage(publicId)
      setIsTransforming(true)
    } catch (error) {
      console.error("❌ Error uploading image:", error)
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload image"
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFormat(event.target.value as SocialFormat)
    setIsTransforming(true)
    setDownloadUrl(null)
    setErrorMessage(null)
  }

  const handleDownload = async () => {
    if (!downloadUrl) {
      setErrorMessage("Image preview is still loading. Please wait before downloading.")
      return
    }

    setIsDownloading(true)
    setErrorMessage(null)
    try {
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error("Failed to download transformed image.")
      }

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = `${selectedFormat.replace(/\s+/g, "_").toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to download image."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const selectedConfig = socialFormats[selectedFormat]

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Social Media Image Creator</h1>
        <p className="text-base-content/70">
          Upload once and export a black-theme preview for each social format.
        </p>
      </div>

      <div className="card border border-base-300 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          {errorMessage && (
            <div className="alert alert-error mb-4">
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <h2 className="card-title mb-4">Select Social Media Format</h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={handleFormatChange}
                  disabled={isUploading || isTransforming}
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative mt-6">
                <h3 className="mb-2 text-lg font-semibold">Preview:</h3>
                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-base-100/70 backdrop-blur-sm">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100">
                    <CldImage
                      key={`${uploadedImage}-${selectedFormat}`}
                      width={selectedConfig.width}
                      height={selectedConfig.height}
                      src={uploadedImage}
                      sizes="100vw"
                      alt="Transformed social media image preview"
                      crop="fill"
                      aspectRatio={selectedConfig.aspectRatio}
                      gravity="auto"
                      onLoad={(event) => {
                        setIsTransforming(false)
                        setDownloadUrl(
                          event.currentTarget.currentSrc || event.currentTarget.src
                        )
                      }}
                      onError={() => {
                        setIsTransforming(false)
                        setDownloadUrl(null)
                        setErrorMessage(
                          "Failed to transform image for the selected format."
                        )
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="card-actions mt-6 justify-end">
                <button
                  className="btn btn-primary"
                  onClick={handleDownload}
                  disabled={isTransforming || isDownloading || !downloadUrl}
                >
                  {isDownloading
                    ? "Preparing download..."
                    : `Download for ${selectedFormat}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
