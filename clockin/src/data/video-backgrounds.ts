export interface VideoBackground {
  id: string;
  name: string;
  embedUrl: string;
  thumbnail: string;
  category: "nature" | "urban" | "abstract" | "ambient";
}

// YouTube ambient videos - looping background scenes
// Note: These are popular ambient videos that are typically available long-term
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
    embedUrl: "https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1&mute=1&loop=1&playlist=mPZkdNFkNps&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/mPZkdNFkNps/mqdefault.jpg",
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
    embedUrl: "https://www.youtube.com/embed/DV1hQSt6hig?autoplay=1&mute=1&loop=1&playlist=DV1hQSt6hig&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/DV1hQSt6hig/mqdefault.jpg",
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
    embedUrl: "https://www.youtube.com/embed/9zZUbIO9j6E?autoplay=1&mute=1&loop=1&playlist=9zZUbIO9j6E&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/9zZUbIO9j6E/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    embedUrl: "https://www.youtube.com/embed/1fueZCTYkpA?autoplay=1&mute=1&loop=1&playlist=1fueZCTYkpA&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/1fueZCTYkpA/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    embedUrl: "https://www.youtube.com/embed/0EOBXbV8N0k?autoplay=1&mute=1&loop=1&playlist=0EOBXbV8N0k&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/0EOBXbV8N0k/mqdefault.jpg",
    category: "urban",
  },
];
