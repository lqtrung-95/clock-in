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
    id: "northern-lights",
    name: "Northern Lights",
    embedUrl: "https://www.youtube.com/embed/4yQI1p5QZPU?autoplay=1&mute=1&loop=1&playlist=4yQI1p5QZPU&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/4yQI1p5QZPU/mqdefault.jpg",
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
    id: "jazz-cafe",
    name: "Jazz Cafe",
    embedUrl: "https://www.youtube.com/embed/qH3fETPsqXU?autoplay=1&mute=1&loop=1&playlist=qH3fETPsqXU&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/qH3fETPsqXU/mqdefault.jpg",
    category: "ambient",
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
    embedUrl: "https://www.youtube.com/embed/eZe4Q_58UTU?autoplay=1&mute=1&loop=1&playlist=eZe4Q_58UTU&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/eZe4Q_58UTU/mqdefault.jpg",
    category: "urban",
  },
];
