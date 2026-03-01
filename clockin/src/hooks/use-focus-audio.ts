"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export const AMBIENT_SOUNDS = [
  { name: "Rain", src: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", volume: 1 },
  { name: "Wind", src: "https://actions.google.com/sounds/v1/weather/wind.ogg", volume: 4 },
  { name: "Coffee", src: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg", volume: 1 },
  { name: "Thunder", src: "https://actions.google.com/sounds/v1/weather/thunder_crack.ogg", volume: 1 },
];

export function useFocusAudio(selectedSound: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const initAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (selectedSound) {
      const soundConfig = AMBIENT_SOUNDS.find((s) => s.src === selectedSound);
      const volumeMultiplier = soundConfig?.volume || 1;
      const audio = new Audio(selectedSound);
      audio.loop = true;
      audio.volume = Math.min(volume * volumeMultiplier, 1);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
    }
  }, [selectedSound, volume]);

  const playAudio = useCallback(async () => {
    if (!selectedSound) return true;
    initAudio();
    if (!audioRef.current) return false;
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
      return true;
    } catch (err) {
      console.error("Audio play failed:", err);
      return false;
    }
  }, [selectedSound, initAudio]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current && selectedSound) {
      const soundConfig = AMBIENT_SOUNDS.find((s) => s.src === selectedSound);
      const volumeMultiplier = soundConfig?.volume || 1;
      audioRef.current.volume = Math.min(volume * volumeMultiplier, 1);
    }
  }, [volume, selectedSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { volume, setVolume, isPlaying, audioEnabled, setAudioEnabled, playAudio, pauseAudio };
}
