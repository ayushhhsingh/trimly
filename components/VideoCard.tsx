import React, { useState, useCallback } from 'react';
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "@/types";

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video"
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
    });
  }, []);

  const formatSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const compressionPercentage = Math.max(
    0,
    Math.round((1 - video.compressedSize / Math.max(video.originalSize, 1)) * 100)
  );

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div
      className="overflow-hidden rounded-lg border border-base-300 bg-base-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      onMouseEnter={() => {
        setPreviewError(false);
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-video relative">
        {isHovered ? (
          previewError ? (
            <div className="flex h-full w-full items-center justify-center bg-base-300">
              <p className="text-error">Preview not available</p>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-2 right-2 flex items-center rounded-md bg-base-100/80 px-2 py-1 text-xs backdrop-blur">
          <Clock size={14} className="mr-1" />
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">{video.title}</h2>
        <p className="text-sm text-base-content/70 mb-2">
          {video.description || "Video upload test"}
        </p>
        <p className="text-sm text-base-content/60 mb-4">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center">
            <FileUp size={16} className="mr-2 text-primary" />
            <div>
              <div className="font-medium">Original</div>
              <div className="text-xs">{formatSize(video.originalSize)}</div>
            </div>
          </div>
          <div className="flex items-center">
            <FileDown size={16} className="mr-2 text-secondary" />
            <div>
              <div className="font-medium">Compressed</div>
              <div className="text-xs">{formatSize(video.compressedSize)}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Compression: <span className="text-success">{compressionPercentage}%</span>
          </div>
          <button
            className="btn btn-primary btn-xs rounded-full"
            onClick={() => onDownload(getFullVideoUrl(video.publicId), video.title)}
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
