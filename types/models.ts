export type BaseRecord = {
  id: string;
  created?: string;
  updated?: string;
};

export type CatRecord = BaseRecord & {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  published?: boolean;
};

export type PhotoRecord = BaseRecord & {
  cat: string;
  image?: string;
  caption?: string;
};
