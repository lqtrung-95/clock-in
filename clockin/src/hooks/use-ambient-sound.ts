"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export function useAmbientSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  // Initialize audio on first user interaction
  const initAudio = useCallback((src: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.crossOrigin = "anonymous";
    }
    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
      audioRef.current.volume = volume;
    }
    setCurrentSrc(src);
  }, [volume]);

  const play = useCallback(async (src: string) => {
    initAudio(src);

    if (!audioRef.current) return false;

    try {
      // Reset the audio to ensure it starts fresh
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        return true;
      }
    } catch (err) {
      // Autoplay blocked - user must interact first
      console.log("Audio autoplay blocked:", err);
      setIsPlaying(false);
    }
    return false;
  }, [initAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (!audioRef.current) return false;

    if (isPlaying) {
      pause();
      return true;
    } else {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        return true;
      } catch (err) {
        console.log("Audio toggle failed:", err);
        setIsPlaying(false);
        return false;
      }
    }
  }, [isPlaying, pause]);

  const changeVolume = useCallback((v: number) => {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { isPlaying, play, pause, toggle, volume, changeVolume, currentSrc };
}
