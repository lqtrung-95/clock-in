export interface VideoBackground {
  id: string;
  name: string;
  embedUrl: string;
  thumbnail: string;
  category: "nature" | "urban" | "abstract" | "ambient";
}

// YouTube ambient videos - looping background scenes
// Refreshed 2026-09 against currently popular focus/study content (verified
// live + embeddable via `npm run check:videos`, which re-checks this list).
export const VIDEO_BACKGROUNDS: VideoBackground[] = [
  {
    id: "lofi-girl-radio",
    name: "Lofi Girl Radio",
    embedUrl: "https://www.youtube.com/embed/X4VbdwhkE10?autoplay=1&mute=1&loop=1&playlist=X4VbdwhkE10&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/X4VbdwhkE10/mqdefault.jpg",
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
    embedUrl: "https://www.youtube.com/embed/mKCieTImjvU?autoplay=1&mute=1&loop=1&playlist=mKCieTImjvU&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/mKCieTImjvU/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "ghibli-village-morning",
    name: "Cozy Village Morning",
    embedUrl: "https://www.youtube.com/embed/DFvd1WJKC6E?autoplay=1&mute=1&loop=1&playlist=DFvd1WJKC6E&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/DFvd1WJKC6E/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "coding-coffee-shop",
    name: "Coding Coffee Shop",
    embedUrl: "https://www.youtube.com/embed/GHyXy7GcKjI?autoplay=1&mute=1&loop=1&playlist=GHyXy7GcKjI&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/GHyXy7GcKjI/mqdefault.jpg",
    category: "ambient",
  },
  {
    id: "mountain-lake",
    name: "Mountain Lake",
    embedUrl: "https://www.youtube.com/embed/qAYkbkUE1Og?autoplay=1&mute=1&loop=1&playlist=qAYkbkUE1Og&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/qAYkbkUE1Og/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "forest-ambience",
    name: "Forest Ambience",
    embedUrl: "https://www.youtube.com/embed/HWBH-ei39KM?autoplay=1&mute=1&loop=1&playlist=HWBH-ei39KM&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/HWBH-ei39KM/mqdefault.jpg",
    category: "nature",
  },
  {
    id: "nyc-rain-night",
    name: "NYC Rain at Night",
    embedUrl: "https://www.youtube.com/embed/6A-H1tni5Xg?autoplay=1&mute=1&loop=1&playlist=6A-H1tni5Xg&controls=0&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/6A-H1tni5Xg/mqdefault.jpg",
    category: "urban",
  },
];
