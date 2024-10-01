import axios from "axios";
import { NextResponse } from "next/server";

// Define types for the response data
interface VAResponse {
  record: {
    systemNumber: string;
    artistMakerPerson?: string; // This might be an object, adjust type if necessary
    titles?: [{ title: string; assigned: string }];
    summaryDescription?: string;
    physicalDescription?: string;
    materials?: string[];
    techniques?: string[];
    placesOfOrigin?: string[];
    productionDates?: string[];
    briefDescription?: string;
    associatedObjects?: any[]; // Define a more specific type if you know the structure
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
  maker: string;
  title: string;
  description: string;
  physicalDescription?: string;
  materials?: string[];
  techniques?: string[];
  origins?: string[];
  productionDates?: string[];
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

    const vaFullItem: VAFullItem = {
      id: record.systemNumber,
      maker: record.artistMakerPerson || "No maker",
      title: record.titles?.[0]?.title || "No title",
      description: record.summaryDescription || "No description",
      physicalDescription: record.physicalDescription || "No description",
      materials: record.materials || [],
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
