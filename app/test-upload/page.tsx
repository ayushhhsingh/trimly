"use client"

import React, { useState } from "react"

type DiagnosticResult = {
  status: "success" | "error" | "testing"
  message: string
  details?: unknown
}

export default function TestUpload() {
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({})
  const [isLoading, setIsLoading] = useState(false)

  const testCloudinary = async () => {
    setIsLoading(true)
    setResults((prev) => ({ ...prev, cloudinary: { status: "testing", message: "Testing Cloudinary credentials..." } }))

    try {
      // Test by checking if env vars are accessible
      const response = await fetch("/api/test-config")
      const data = await response.json()
      
      setResults((prev) => ({
        ...prev,
        cloudinary: {
          status: response.ok ? "success" : "error",
          message: response.ok ? "Cloudinary configured" : "Configuration error",
          details: data
        }
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        cloudinary: {
          status: "error",
          message: "Failed to test Cloudinary",
          details: String(error)
        }
      }))
    }
    setIsLoading(false)
  }

  const testVideoUpload = async () => {
    setIsLoading(true)
    setResults((prev) => ({ ...prev, video: { status: "testing", message: "Uploading test video..." } }))

    try {
      const formData = new FormData()
      // Create a small test video blob
      const testBlob = new Blob(["test"], { type: "video/mp4" })
      formData.append("file", testBlob, "test.mp4")
      formData.append("title", "Test Video")
      formData.append("description", "Test")
      formData.append("originalSize", "4")

      const response = await fetch("/api/video-upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        video: {
          status: response.ok ? "success" : "error",
          message: response.ok ? "Video upload successful" : "Video upload failed",
          details: data
        }
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        video: {
          status: "error",
          message: "Failed to upload video",
          details: String(error)
        }
      }))
    }
    setIsLoading(false)
  }

  const testImageUpload = async () => {
    setIsLoading(true)
    setResults((prev) => ({ ...prev, image: { status: "testing", message: "Uploading test image..." } }))

    try {
      const formData = new FormData()
      // Create a small test image blob
      const testBlob = new Blob(["test"], { type: "image/png" })
      formData.append("file", testBlob, "test.png")

      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        image: {
          status: response.ok ? "success" : "error",
          message: response.ok ? "Image upload successful" : "Image upload failed",
          details: data
        }
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        image: {
          status: "error",
          message: "Failed to upload image",
          details: String(error)
        }
      }))
    }
    setIsLoading(false)
  }

  const testDatabase = async () => {
    setIsLoading(true)
    setResults((prev) => ({ ...prev, database: { status: "testing", message: "Testing database connection..." } }))

    try {
      const response = await fetch("/api/videos")
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        database: {
          status: response.ok ? "success" : "error",
          message: response.ok ? "Database connected" : "Database error",
          details: `Status: ${response.status}, Videos found: ${Array.isArray(data) ? data.length : 0}`
        }
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        database: {
          status: "error",
          message: "Failed to connect to database",
          details: String(error)
        }
      }))
    }
    setIsLoading(false)
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "testing":
        return "⏳"
      default:
        return "⚪"
    }
  }

  const formatDetails = (details: unknown) => {
    return typeof details === "string" ? details : JSON.stringify(details, null, 2)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">🧪 Upload System Diagnostics</h1>
        <p className="text-base-content/70">
          Test your Cloudinary, Database, and Upload configurations
        </p>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cloudinary Test */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl">☁️ Cloudinary Configuration</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Test if Cloudinary credentials are properly configured
            </p>
            {results.cloudinary && (
              <div className={`alert ${results.cloudinary.status === "success" ? "alert-success" : results.cloudinary.status === "error" ? "alert-error" : "alert-info"} mb-4`}>
                <span>
                  {getStatusIcon(results.cloudinary.status)} {results.cloudinary.message}
                </span>
              </div>
            )}
            {typeof results.cloudinary?.details !== "undefined" && (
              <div className="bg-base-300 rounded-lg p-3 text-xs font-mono overflow-auto max-h-40">
                <pre>{formatDetails(results.cloudinary.details)}</pre>
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <button
                onClick={testCloudinary}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Test Cloudinary"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Database Test */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl">💾 Database Connection</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Test if PostgreSQL/NeonDB connection is working
            </p>
            {results.database && (
              <div className={`alert ${results.database.status === "success" ? "alert-success" : results.database.status === "error" ? "alert-error" : "alert-info"} mb-4`}>
                <span>
                  {getStatusIcon(results.database.status)} {results.database.message}
                </span>
              </div>
            )}
            {typeof results.database?.details !== "undefined" && (
              <div className="bg-base-300 rounded-lg p-3 text-xs font-mono">
                <pre>{formatDetails(results.database.details)}</pre>
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <button
                onClick={testDatabase}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Test Database"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Video Upload Test */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl">📹 Video Upload</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Test uploading a small video file to Cloudinary
            </p>
            {results.video && (
              <div className={`alert ${results.video.status === "success" ? "alert-success" : results.video.status === "error" ? "alert-error" : "alert-info"} mb-4`}>
                <span>
                  {getStatusIcon(results.video.status)} {results.video.message}
                </span>
              </div>
            )}
            {typeof results.video?.details !== "undefined" && (
              <div className="bg-base-300 rounded-lg p-3 text-xs font-mono overflow-auto max-h-40">
                <pre>{formatDetails(results.video.details)}</pre>
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <button
                onClick={testVideoUpload}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Test Video Upload"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload Test */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl">🖼️ Image Upload</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Test uploading an image to Cloudinary
            </p>
            {results.image && (
              <div className={`alert ${results.image.status === "success" ? "alert-success" : results.image.status === "error" ? "alert-error" : "alert-info"} mb-4`}>
                <span>
                  {getStatusIcon(results.image.status)} {results.image.message}
                </span>
              </div>
            )}
            {typeof results.image?.details !== "undefined" && (
              <div className="bg-base-300 rounded-lg p-3 text-xs font-mono overflow-auto max-h-40">
                <pre>{formatDetails(results.image.details)}</pre>
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <button
                onClick={testImageUpload}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Test Image Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">How to Diagnose Issues:</h3>
          <div className="text-sm">
            1. Click each test button above
            2. Check the terminal/console for detailed logs (marked with 🔍, ✅, ❌)
            3. Review the error details below each test
            4. Common issues:
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>❌ 401 Unauthorized - Sign in with Clerk first</li>
              <li>❌ Credentials not found - Check .env file</li>
              <li>❌ Upload failed - Check Cloudinary API keys</li>
              <li>❌ Database error - Check NeonDB connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
