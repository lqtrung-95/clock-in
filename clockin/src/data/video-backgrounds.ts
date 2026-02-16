export interface VideoBackground {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: "nature" | "urban" | "abstract" | "ambient";
}

// Reliable video backgrounds from Coverr (free, CDN hosted)
export const VIDEO_BACKGROUNDS: VideoBackground[] = [
  {
    id: "rain-window",
    name: "Rain on Window",
    url: "https://storage.coverr.co/videos/coverr-rain-on-a-window-3397/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&q=60",
    category: "nature",
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    url: "https://storage.coverr.co/videos/coverr-ocean-waves-1554/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&q=60",
    category: "nature",
  },
  {
    id: "fireplace",
    name: "Cozy Fireplace",
    url: "https://storage.coverr.co/videos/coverr-a-cozy-fireplace-2581/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=200&q=60",
    category: "ambient",
  },
  {
    id: "coffee-pour",
    name: "Coffee Steam",
    url: "https://storage.coverr.co/videos/coverr-pouring-coffee-1522/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=60",
    category: "ambient",
  },
  {
    id: "forest-stream",
    name: "Forest Stream",
    url: "https://storage.coverr.co/videos/coverr-a-stream-in-the-forest-990/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60",
    category: "nature",
  },
  {
    id: "city-night",
    name: "City Night",
    url: "https://storage.coverr.co/videos/coverr-city-at-night-4242/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&q=60",
    category: "urban",
  },
  {
    id: "snow-falling",
    name: "Snow Falling",
    url: "https://storage.coverr.co/videos/coverr-snow-falling-2455/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=200&q=60",
    category: "nature",
  },
  {
    id: "starry-night",
    name: "Starry Night",
    url: "https://storage.coverr.co/videos/coverr-starry-night-sky-2876/1080p.mp4",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=60",
    category: "abstract",
  },
];
