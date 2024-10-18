import axios from "axios";
import { NextResponse } from "next/server";
import { ImageMeta, fullItem } from "../../types";

interface ArtistMakerPerson {
  name: { text: string; id?: string };
  association: { text: string; id?: string };
  note: string;
}

interface ImageResponse {
  _iiif_image: string;
  imagesMeta: ImageMeta[];
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
    images: { _iiif_image: string; _images_meta: ImageMeta[] };
  };
}

interface RequestBody {
  id: string;
}

export async function POST(req: Request) {
  const { id }: RequestBody = await req.json();

  try {
    const vaResponse = await axios.get<VAResponse>(
      `https://api.vam.ac.uk/v2/museumobject/${id}`
    );

    const record = vaResponse.data.record;
    const metaRecord = vaResponse.data.meta;

    const makers = record.artistMakerPerson
      ? record.artistMakerPerson.map((person) => ({
          name: person.name.text,
          id: person.name.id || "No ID",
        }))
      : [{ name: "No maker", id: "No ID" }];

    const images: ImageResponse = {
      _iiif_image: metaRecord.images?._iiif_image || "/images/no_image.png",
      imagesMeta: metaRecord.images?._images_meta || [],
    };

    const vaFullItem: fullItem = {
      id: record.systemNumber,
      searchSource: "va",
      maker: makers,
      title: record.titles?.[0]?.title || "Untitled",
      description: record.summaryDescription || "No description",
      physicalDescription: record.physicalDescription || "No description",
      materials: record.materials || [{ text: "none", id: "none" }],
      techniques: record.techniques || [],
      placesOfOrigin: record.placesOfOrigin || [],
      productionDates: record.productionDates || [],
      images: images,
      baseImageUrl: metaRecord.images?._iiif_image || "/images/no_image.png",
      briefDescription: record.briefDescription || "No description",
    };

    console.log("vaFullItem ----", vaFullItem);

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
