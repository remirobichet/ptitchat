export type BaseRecord = {
  id: string;
  created?: string;
  updated?: string;
};

export type CatRecord = BaseRecord & {
  name: string;
  slug: string;
  description?: string;
  coverPhoto?: string;
  published?: boolean;
};

export type PhotoRecord = BaseRecord & {
  cat: string;
  image?: string;
  caption?: string;
};

export type StorySectionType = "hero" | "content" | "gallery";

export type StorySectionRecord = BaseRecord & {
  cat: string;
  type: StorySectionType;
  title?: string;
  text?: string;
  photos?: string[];
  order?: number;
  isVisible?: boolean;
};
