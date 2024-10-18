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

export interface ImageMeta {
  assetRef: string;
}

export interface Item {
  id: string;
  searchSource: string;
  maker?: Maker[];
  title?: string;
  description?: string;
  physicalDescription?: string;
  materials?: Material[];
  techniques?: Technique[];
  origins?: Origin[];
  baseImageUrl: string;

  images?: {
    _iiif_image: string;
    imagesMeta?: ImageMeta[];
  };
  provider?: string;
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
}

export interface fullItem {
  id: string;
  searchSource: string;

  title: string;
  maker: Maker[];
  date?: string;
  baseImageUrl: string;
  description: string;
  physicalDescription: string;
  materials: Material[];
  techniques: Technique[];
  placesOfOrigin?: {
    place: { text: string; id?: string };
    association: { text: string };
  }[];
  productionDates?: {
    date: { text: string };
    association: { text: string };
  }[];
  images?: {
    _iiif_image: string;
    imagesMeta?: ImageMeta[];
  };
  briefDescription: string;
}

export interface Results {
  va: ArtItem[];
  europeana: ArtItem[]; // Add Europeana results
  info: { record_count: number; image_count: number };
}
