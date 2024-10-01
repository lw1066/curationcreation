import axios from "axios";
import { NextResponse } from "next/server";

interface ArtistMakerPerson {
  name: { text: string; id?: string };
  association: { text: string; id?: string };
  note: string;
}

interface Maker {
  name: string;
  id?: string;
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
    images: string[];
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
  images: any[];
  briefDescription?: string;
}

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
      images: vaResponse.data.meta.images || [],
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
