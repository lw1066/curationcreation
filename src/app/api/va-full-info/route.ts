import axios from "axios";
import { NextResponse } from "next/server";
import { Item } from "../../types";
import sanitizeHtml from "sanitize-html";

interface ArtistMakerPerson {
  name: { text: string; id?: string };
  association: { text: string; id?: string };
  note: string;
}

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
    images?: { _iiif_image?: string; _images_meta?: { assetRef: string }[] };
  };
}

const sanitizeHTML = (htmlString: string): string => {
  return sanitizeHtml(htmlString, {
    allowedTags: ["i", "em", "b", "strong", "br", "p"],
    allowedAttributes: {},
  });
};

export async function POST(req: Request) {
  try {
    const { id }: { id: string } = await req.json();

    if (!id) {
      throw new Error("Missing ID parameter in the request.");
    }

    const vaResponse = await axios.get<VAResponse>(
      `https://api.vam.ac.uk/v2/museumobject/${id}`
    );

    const record = vaResponse.data.record;
    const metaRecord = vaResponse.data.meta;

    if (!record || !metaRecord) {
      throw new Error("Incomplete data: record or metaRecord is missing.");
    }

    // Handle makers
    const makers = record.artistMakerPerson
      ? record.artistMakerPerson.map((person) => ({
          name: person.name.text,
          id: person.name.id || "No ID",
        }))
      : [{ name: "No maker", id: "No ID" }];

    // Handle images
    const imageUrls: string[] = metaRecord.images?._images_meta
      ? metaRecord.images._images_meta.map((image) => {
          return `https://framemark.vam.ac.uk/collections/${image.assetRef}/full/full/0/default.jpg`;
        })
      : [];

    const imagesCount = imageUrls?.length || 0;

    // Handle materials
    const materials =
      record.materials && record.materials.length > 0
        ? record.materials.map((material) => {
            return { text: material.text, id: material.id };
          })
        : [];

    // Handle techniques
    const techniques =
      record.techniques && record.techniques.length > 0
        ? record.techniques.map((technique) => {
            return { text: technique.text, id: technique.id };
          })
        : [];

    const vaFullItem: Item = {
      id: record.systemNumber,
      searchSource: "va",
      maker: makers,
      title: sanitizeHTML(record.titles?.[0]?.title || "Untitled"),
      description: sanitizeHTML(record.summaryDescription || "Not provided"),
      physicalDescription: sanitizeHTML(
        record.physicalDescription || "Not provided"
      ),
      materials: materials,
      techniques: techniques,
      placesOfOrigin: record.placesOfOrigin || [],
      productionDates: record.productionDates || [],
      imageUrls: imageUrls,
      imagesCount: imagesCount,
      baseImageUrl:
        `${metaRecord.images?._iiif_image}/full/full/0/default.jpg` ||
        "/images/no_image.png",
      briefDescription: sanitizeHTML(record.briefDescription || "Not provided"),
    };

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Art retrieved successfully!",
      data: {
        vaFullItem,
      },
    });
  } catch (error) {
    let errorMessage = "An unknown error occurred.";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `API Error: ${error.response.statusText} (Status: ${error.response.status})`;
      } else if (error.request) {
        errorMessage = "No response received from the API. Please try again.";
      } else {
        errorMessage = "Network error. Please check your connection.";
      }
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }

    console.error("Error fetching V&A item:", errorMessage);

    return NextResponse.json({
      status: 500,
      success: false,
      message: errorMessage,
    });
  }
}
