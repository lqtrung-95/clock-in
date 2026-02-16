export interface VideoBackground {
  id: string;
  name: string;
  embedUrl: string;
  thumbnail: string;
  category: "nature" | "urban" | "abstract" | "ambient";
}

// YouTube video backgrounds - reliable, free, looped
export const VIDEO_BACKGROUNDS: VideoBackground[] = [
  {
    id: "lofi-girl",
    name: "Lofi Girl",
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&loop=1&playlist=jfKfPfyJRdk&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "rain-window",
    name: "Rain on Window",
    embedUrl: "https://www.youtube.com/embed/8plwv25NYRo?autoplay=1&mute=1&loop=1&playlist=8plwv25NYRo&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/8plwv25NYRo/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "fireplace",
    name: "Cozy Fireplace",
    embedUrl: "https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&mute=1&loop=1&playlist=L_LUpnjgPso&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/L_LUpnjgPso/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    embedUrl: "https://www.youtube.com/embed/1ZYbU82GVz4?autoplay=1&mute=1&loop=1&playlist=1ZYbU82GVz4&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/1ZYbU82GVz4/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "forest-stream",
    name: "Forest Stream",
    embedUrl: "https://www.youtube.com/embed/IvjMgVS6kng?autoplay=1&mute=1&loop=1&playlist=IvjMgVS6kng&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/IvjMgVS6kng/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "snow-falling",
    name: "Snow Falling",
    embedUrl: "https://www.youtube.com/embed/7HaJArMDKgI?autoplay=1&mute=1&loop=1&playlist=7HaJArMDKgI&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/7HaJArMDKgI/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    embedUrl: "https://www.youtube.com/embed/7NOSDKb0HlU?autoplay=1&mute=1&loop=1&playlist=7NOSDKb0HlU&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/7NOSDKb0HlU/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "starry-night",
    name: "Starry Night",
    embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=1&loop=1&playlist=5qap5aO4i9A&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg",
    category: "abstract",
  },
];
