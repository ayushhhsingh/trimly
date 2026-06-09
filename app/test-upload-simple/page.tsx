"use client"

import React, { useState } from "react"

type ResultState = {
  type: "success" | "error" | "info"
  message: string
}

const maxFileSize = 70 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes"

  const units = ["Bytes", "KB", "MB", "GB"]
  const index = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${Number((bytes / 1024 ** index).toFixed(2))} ${units[index]}`
}

export default function TestUploadSimple() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [debugInfo, setDebugInfo] = useState("No tests run yet.")
  const [result, setResult] = useState<ResultState | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      setResult({ type: "error", message: "Error: Please enter a title." })
      return
    }

    if (!file) {
      setResult({ type: "error", message: "Error: Please select a video file." })
      return
    }

    if (file.size > maxFileSize) {
      setResult({ type: "error", message: "Error: File too large. Max 70MB allowed." })
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", trimmedTitle)
    formData.append("description", trimmedDescription)
    formData.append("originalSize", file.size.toString())

    setDebugInfo(
      [
        "FormData created:",
        `- file: ${file.name} (${formatBytes(file.size)})`,
        `- title: ${trimmedTitle}`,
        `- description: ${trimmedDescription || "(empty)"}`,
        `- originalSize: ${file.size}`,
        "",
        "Uploading to /api/video-upload...",
      ].join("\n")
    )
    setResult(null)
    setProgress(0)
    setIsUploading(true)

    try {
      const response = await fetch("/api/video-upload", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as unknown
      setProgress(100)

      if (response.ok) {
        setResult({
          type: "success",
          message: `Upload successful.\n\nResponse:\n${JSON.stringify(data, null, 2)}\n\nCheck the /home page to see your video.`,
        })
      } else {
        setResult({
          type: "error",
          message: `Upload failed (${response.status}).\n\nError details:\n${JSON.stringify(data, null, 2)}`,
        })
      }
    } catch (error) {
      setResult({
        type: "error",
        message: `Network error.\n\n${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-base-100 px-4 py-10 text-base-content">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold">FormData Upload Test</h1>
          <p className="text-base-content/70">
            Validate the video upload API from a DaisyUI black-theme test screen.
          </p>
        </div>

        <div className="alert alert-info border-info bg-info/10">
          <div>
            <h2 className="font-bold">How to use this test</h2>
            <p className="text-sm">
              Sign in, enter a title, select a video under 70MB, and submit the
              FormData request.
            </p>
          </div>
        </div>

        <section className="card border border-base-300 bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Upload Request</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-control">
                <label className="label" htmlFor="title">
                  <span className="label-text font-semibold">Video Title</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className="input input-bordered bg-base-100"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter video title"
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="description">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  id="description"
                  className="textarea textarea-bordered bg-base-100"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Enter video description"
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="file">
                  <span className="label-text font-semibold">Video File</span>
                </label>
                <input
                  id="file"
                  type="file"
                  accept="video/*"
                  className="file-input file-input-bordered bg-base-100"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  required
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <progress className="progress progress-primary w-full" value={progress} max="100" />
                  <p className="text-center text-sm text-base-content/70">Uploading...</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Test FormData Upload"}
              </button>
            </form>
          </div>
        </section>

        {result && (
          <section
            className={`alert ${
              result.type === "success"
                ? "alert-success"
                : result.type === "error"
                  ? "alert-error"
                  : "alert-info"
            }`}
          >
            <pre className="whitespace-pre-wrap text-sm">{result.message}</pre>
          </section>
        )}

        <section className="card border border-base-300 bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Debug Info</h2>
            <pre className="max-h-72 overflow-auto rounded-lg bg-base-300 p-4 text-xs">
              {debugInfo}
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}
