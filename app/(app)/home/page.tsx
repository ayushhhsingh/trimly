"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import axios from "axios"
import { Upload } from "lucide-react"
import VideoCard from "@/components/VideoCard"
import { Video } from "@/types"

function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchVideos = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      const response = await axios.get("/api/videos")
      if (Array.isArray(response.data)) {
        setVideos(response.data)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: unknown; error?: unknown }
          | undefined
        const apiMessage =
          typeof responseData?.message === "string"
            ? responseData.message
            : typeof responseData?.error === "string"
              ? responseData.error
              : null
        setError(apiMessage || "Failed to load videos. Please refresh and try again.")
      } else {
        setError("Failed to load videos. Please refresh and try again.")
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchVideos(true)
  }, [fetchVideos])

  const handleDownload = useCallback((url: string, title: string) => {
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${title}.mp4`)
    link.setAttribute("target", "_blank")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm text-base-content/70">Loading your videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-silver-gradient">My Videos</h1>
        <Link href="/video-upload" className="btn btn-primary gap-2">
          <Upload size={18} />
          Upload Video
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => void fetchVideos(false)}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="card border border-base-300 bg-base-200 shadow-xl">
          <div className="card-body items-center text-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-content">
              <Upload size={32} />
            </div>
            <h2 className="card-title text-2xl">No Videos Yet</h2>
            <p className="text-base-content/70 max-w-md">
              Start by uploading your first video. We will compress it automatically and make it ready for sharing.
            </p>
            <div className="card-actions mt-4">
              <Link href="/video-upload" className="btn btn-primary">
                Upload Your First Video
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
