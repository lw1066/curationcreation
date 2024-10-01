import axios from "axios";
import { NextResponse } from "next/server";

interface ArtistMakerPerson {
  name: { text: string; id?: string }; // Assuming name has 'text' and possibly 'id'
  association: { text: string; id?: string }; // Assuming association has 'text' and 'id'
  note: string; // Note might be an optional string
}

interface Maker {
  name: string; // name is a required field
  id?: string; // id is an optional field
}

// Define types for the response data
interface VAResponse {
  record: {
    systemNumber: string;
    artistMakerPerson?: ArtistMakerPerson[]; // This is now an array of objects
    titles?: { title: string; type: string }[]; // 'type' replaces 'assigned' based on the structure you shared
    summaryDescription?: string;
    physicalDescription?: string;
    materials?: { text: string; id: string }[]; // Array of materials with 'text' and 'id'
    techniques?: { text: string; id: string }[]; // Techniques as array with 'text' and 'id'
    placesOfOrigin?: {
      place: { text: string; id?: string };
      association: { text: string };
    }[]; // Adjust this based on structure
    productionDates?: {
      date: { text: string };
      association: { text: string };
    }[]; // Adjust based on actual data
    briefDescription?: string;
    associatedObjects?: any[];
  };
  meta: {
    images: any[]; // Define a more specific type if you know the structure of images
  };
}

// Define the type for the request body
interface RequestBody {
  id: string;
}

// Define the type for the full item response
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
  images: any[]; // Define a more specific type if you know the structure of images
  briefDescription?: string;
  associatedObjects?: any[]; // Define a more specific type if you know the structure
}

export async function POST(req: Request) {
  const { id }: RequestBody = await req.json(); // Type the request body

  try {
    const vaResponse = await axios.get<VAResponse>(
      `https://api.vam.ac.uk/v2/museumobject/${id}`
    );

    const record = vaResponse.data.record;

    const makers = record.artistMakerPerson
      ? record.artistMakerPerson.map((person) => ({
          name: person.name.text,
          id: person.name.id || "No ID", // Provide fallback if 'id' is missing
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
      associatedObjects: record.associatedObjects || [],
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
