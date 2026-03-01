"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface CustomVideo {
  id: string;
  name: string;
  embedUrl: string;
  thumbnail: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function useFocusCustomVideos(
  videoEmbedUrl: string,
  setVideoEmbedUrl: (url: string) => void
) {
  const [customVideos, setCustomVideos] = useState<CustomVideo[]>([]);
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("customFocusVideos");
    if (stored) {
      try {
        setCustomVideos(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  function handleAddCustomVideo() {
    const videoId = extractYouTubeId(newVideoUrl);
    if (!videoId) { toast.error("Invalid YouTube URL"); return; }
    if (!newVideoTitle.trim()) { toast.error("Please enter a title"); return; }

    const newVideo: CustomVideo = {
      id: `custom-${Date.now()}`,
      name: newVideoTitle.trim(),
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
    const updated = [...customVideos, newVideo];
    setCustomVideos(updated);
    localStorage.setItem("customFocusVideos", JSON.stringify(updated));
    setNewVideoUrl("");
    setNewVideoTitle("");
    setShowAddVideoDialog(false);
    toast.success("Video added");
  }

  function handleDeleteCustomVideo(id: string) {
    const toDelete = customVideos.find((v) => v.id === id);
    const updated = customVideos.filter((v) => v.id !== id);
    setCustomVideos(updated);
    localStorage.setItem("customFocusVideos", JSON.stringify(updated));
    if (toDelete && videoEmbedUrl === toDelete.embedUrl) {
      setVideoEmbedUrl("");
    }
    toast.success("Video removed");
  }

  return {
    customVideos,
    showAddVideoDialog, setShowAddVideoDialog,
    newVideoUrl, setNewVideoUrl,
    newVideoTitle, setNewVideoTitle,
    handleAddCustomVideo,
    handleDeleteCustomVideo,
  };
}
