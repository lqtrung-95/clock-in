export interface BackgroundImage {
  id: string;
  name: string;
  /** Path relative to /public/backgrounds/ */
  src: string;
  credit: string;
}

export const BACKGROUND_IMAGES: BackgroundImage[] = [
  { id: "default", name: "Default", src: "", credit: "" },
  { id: "forest", name: "Forest", src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80", credit: "Unsplash" },
  { id: "ocean", name: "Ocean", src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80", credit: "Unsplash" },
  { id: "mountain", name: "Mountain", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80", credit: "Unsplash" },
  { id: "night-sky", name: "Night Sky", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80", credit: "Unsplash" },
  { id: "rain", name: "Rain", src: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80", credit: "Unsplash" },
  { id: "library", name: "Library", src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80", credit: "Unsplash" },
  { id: "cafe", name: "Cafe", src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80", credit: "Unsplash" },
];
