"use client"

import React, { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Upload as UploadIcon } from "lucide-react"

function VideoUpload() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const MAX_FILE_SIZE_IN_MB = 10
  const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setErrorMessage("Please select a file first")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_IN_MB}MB limit`)
      return
    }
    if (!title.trim()) {
      setErrorMessage("Title is required")
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("description", description)
    formData.append("originalSize", file.size.toString())

    try {
      const response = await axios.post("/api/video-upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.min(
              100,
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
            setProgress(percent)
          }
        },
      })

      if (response.data.success) {
        router.push("/home")
        router.refresh()
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Upload failed")
      } else {
        setErrorMessage("An unexpected error occurred")
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload a video</h1>

      {errorMessage && (
        <div className="alert alert-error mb-4 shadow-lg">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text font-semibold">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            placeholder="My awesome video"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            placeholder="Tell us about your video"
            rows={3}
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Video file</span>
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
            />
            <p className="text-sm text-center text-base-content/70">
              Uploading... {progress}%
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/home" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VideoUpload
