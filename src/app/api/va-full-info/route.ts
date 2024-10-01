import axios from "axios";
import { NextResponse } from "next/server";

// Interface for artist maker person
interface ArtistMakerPerson {
  name: { text: string; id?: string };
  association: { text: string; id?: string };
  note: string;
}

// Interface for Maker
interface Maker {
  name: string;
  id?: string;
}

// Define types for the image structure
interface ImageMeta {
  assetRef: string; // Reference to the image asset
}

interface ImageResponse {
  iiifImageUrl: string; // URL for the IIIF image
  imagesMeta: ImageMeta[]; // Array of image metadata
}

// Define types for the response data
interface VAResponse {
  record: {
    systemNumber: string;
    artistMakerPerson?: ArtistMakerPerson[];
    titles?: { title: string; type: string }[];
    summaryDescription?: string;
    physicalDescription?: string;
    materials?: { text: string; id: string }[];
    techniques?: { text: string; id: string }[];
    placesOfOrigin?: {
      place: { text: string; id?: string };
      association: { text: string };
    }[];
    productionDates?: {
      date: { text: string };
      association: { text: string };
    }[];
    briefDescription?: string;
  };
  meta: {
    images: { _iiif_image: string; _images_meta: ImageMeta[] }; // Updated to match the response structure
  };
}

interface RequestBody {
  id: string;
}

interface VAFullItem {
  id: string;
  maker: Maker[];
  title: string;
  description: string;
  physicalDescription?: string;
  materials?: { text: string; id: string }[];
  techniques?: { text: string; id: string }[];
  origins?: {
    place: { text: string; id?: string };
    association: { text: string };
  }[];
  productionDates?: {
    date: { text: string };
    association: { text: string };
  }[];
  images: ImageResponse; // Updated to use the new ImageResponse type
  briefDescription?: string;
}

// Handle POST request
export async function POST(req: Request) {
  const { id }: RequestBody = await req.json();

  try {
    const vaResponse = await axios.get<VAResponse>(
      `https://api.vam.ac.uk/v2/museumobject/${id}`
    );

    const record = vaResponse.data.record;

    const makers = record.artistMakerPerson
      ? record.artistMakerPerson.map((person) => ({
          name: person.name.text,
          id: person.name.id || "No ID",
        }))
      : [{ name: "No maker", id: "No ID" }];

    const images: ImageResponse = {
      iiifImageUrl: vaResponse.data.meta.images._iiif_image,
      imagesMeta: vaResponse.data.meta.images._images_meta,
    };
    const vaFullItem: VAFullItem = {
      id: record.systemNumber,
      maker: makers,
      title: record.titles?.[0]?.title || "Untitled",
      description: record.summaryDescription || "No description",
      physicalDescription: record.physicalDescription || "No description",
      materials: record.materials || [{ text: "none", id: "none" }],
      techniques: record.techniques || [],
      origins: record.placesOfOrigin || [],
      productionDates: record.productionDates || [],
      images: images, // Updated to use the structured images array
      briefDescription: record.briefDescription || "No description",
    };

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Art retrieved!",
      data: {
        vaFullItem,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to fetch data from APIs",
    });
  }
}
