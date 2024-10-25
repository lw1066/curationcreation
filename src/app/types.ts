export interface Maker {
  name: string;
  id?: string;
}

export interface Material {
  text: string;
  id?: string;
}

export interface Technique {
  text: string;
  id?: string;
}

export interface Origin {
  place: {
    text: string;
  };
}

export interface Item {
  id: string;
  searchSource: string;
  maker?: Maker[];
  title: string;
  description?: string;
  physicalDescription?: string;
  materials?: Material[];
  techniques?: Technique[];
  placesOfOrigin?: Origin[];
  baseImageUrl: string;
  imageUrls?: string[];
  imagesCount: number;
  provider?: string;
  productionDates?: {
    date: { text: string };
    association: { text: string };
  }[];
  briefDescription?: string;
  date?: string;
  subject?: string;
  country?: string;
  sourceLink?: string;
}

export interface ArtItem {
  id: string;
  searchSource: string;
  title: string;
  maker: Maker;
  date: string;
  baseImageUrl: string;
  imageUrl?: string; // Optional for Europeana items
  year?: string;
  fullImage?: string;
  dataProvider?: string;
  description?: string;
  subject?: string;
  country?: string;
  sourceLink?: string;
}

export interface Results {
  va: ArtItem[];
  europeana: ArtItem[]; // Add Europeana results
  info: { record_count: number; image_count: number; filterpool_count: number };
}
