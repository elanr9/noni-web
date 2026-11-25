/* The creator profile: what brands see, sort and filter on. The same lists
   live in the noni repo (lib/marketplace.ts and the apply-chat edge
   function); keep the three in step. */

export type Gender = "female" | "male" | "nonbinary" | "undisclosed";

export type CreatorProfile = {
  birth_year: number | null;
  gender: Gender | null;
  country: string | null;
  location: string | null;
  languages: string[];
  niches: string[];
  tiktok: string | null;
  tiktok_followers: number | null;
  instagram: string | null;
  instagram_followers: number | null;
  youtube: string | null;
  youtube_followers: number | null;
  portfolio: { url: string; note?: string }[];
  listed: boolean;
};

export const MAX_LANGUAGES = 5;
export const MAX_NICHES = 5;
export const MAX_VIDEOS = 3;

export const NICHES = [
  { key: "social", label: "Social and communication" },
  { key: "finance", label: "Finance and commerce" },
  { key: "entertainment", label: "Entertainment and media" },
  { key: "music", label: "Music" },
  { key: "fitness", label: "Health and fitness" },
  { key: "education", label: "Education and learning" },
  { key: "travel", label: "Travel and local" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "tech", label: "Tech and AI" },
  { key: "photo_video", label: "Photo and video" },
  { key: "food", label: "Food and drink" },
  { key: "home_family", label: "Home and family" },
  { key: "fashion_beauty", label: "Fashion and beauty" },
  { key: "sports", label: "Sports" },
  { key: "gaming", label: "Gaming" },
  { key: "other", label: "Other" },
] as const;

export const LANGUAGES = [
  "English", "Spanish", "Portuguese", "French", "German", "Italian", "Dutch",
  "Arabic", "Hindi", "Urdu", "Bengali", "Chinese", "Japanese", "Korean",
  "Vietnamese", "Thai", "Indonesian", "Tagalog", "Turkish", "Russian",
].map((label) => ({ key: label.toLowerCase(), label }));

export const COUNTRIES = [
  { key: "US", label: "United States" },
  { key: "CA", label: "Canada" },
  { key: "GB", label: "United Kingdom" },
  { key: "AU", label: "Australia" },
];

export const GENDERS: { key: Gender; label: string }[] = [
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
  { key: "nonbinary", label: "Non-binary" },
  { key: "undisclosed", label: "Prefer not to say" },
];

export const EMPTY_PROFILE: CreatorProfile = {
  birth_year: null,
  gender: null,
  country: null,
  location: null,
  languages: [],
  niches: [],
  tiktok: null,
  tiktok_followers: null,
  instagram: null,
  instagram_followers: null,
  youtube: null,
  youtube_followers: null,
  portfolio: [],
  listed: true,
};

export function ageFromBirthYear(year: number | null): number | null {
  return year ? new Date().getFullYear() - year : null;
}

export function birthYearFromAge(age: number): number {
  return new Date().getFullYear() - age;
}

export const isLink = (u: string) => /^https?:\/\/\S+\.\S+/i.test(u.trim());
export const cleanHandle = (v: string) => v.trim().replace(/^@+/, "").replace(/\s+/g, "");
