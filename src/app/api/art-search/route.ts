import axios from "axios";
import { NextResponse } from "next/server";

// Define types for request body
interface ArtSearchRequest {
  query?: string;
  makerId?: string;
  start?: number; // Optional, defaults to 1
}

// Define types for the response structure
interface VAMItem {
  id: string;
  maker: string;
  title: string;
  thumbnailUrl: string;
  baseImageUrl: string;
  imageId: string | null;
  date: string | null;
}

interface ArtSearchResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    va: VAMItem[];
  };
}

// Handle POST request
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { query, makerId, start = 1 }: ArtSearchRequest = await req.json();

    let vaResponse;

    if (makerId) {
      // Search by maker_id
      console.log("in api-----------------------", makerId);
      vaResponse = await axios.get(
        `https://api.vam.ac.uk/v2/objects/search?id_person=${makerId}`,
        {
          params: {
            page: start, // Adjust for pagination
          },
        }
      );
    } else if (query) {
      // Search by general query
      vaResponse = await axios.get("https://api.vam.ac.uk/v2/objects/search/", {
        params: {
          q: query,
          page: start, // Adjust for pagination
        },
      });
    } else {
      return NextResponse.json<ArtSearchResponse>({
        status: 400,
        success: false,
        message: "Either query or makerId must be provided",
      });
    }

    // Map the response to match the format of your data
    const vaItems: VAMItem[] = vaResponse.data.records.map((record: any) => ({
      id: record.systemNumber,
      maker: record._primaryMaker?.name || "Unknown",
      title: record._primaryTitle || "Untitled",
      thumbnailUrl:
        record._images?._primary_thumbnail || "/images/no_image.png",
      baseImageUrl:
        record._images?._iiif_image_base_url || "/images/no_image.png",
      imageId: record._primaryImageId || null,
      date: record._primaryDate || null,
    }));

    return NextResponse.json<ArtSearchResponse>({
      status: 200,
      success: true,
      message: "Art retrieved!",
      data: {
        va: vaItems,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json<ArtSearchResponse>({
      status: 500,
      success: false,
      message: "Failed to fetch data from the API",
    });
  }
}
