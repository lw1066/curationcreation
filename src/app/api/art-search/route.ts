import axios from "axios";
import { NextResponse } from "next/server";

// Define types for request body
interface ArtSearchRequest {
  query?: string;
  makerId?: string;
  start?: number;
}

// Define types for the response structure
interface VAMItem {
  id: string;
  searchSource: string;
  maker: string;
  title: string;
  thumbnailUrl: string;
  baseImageUrl: string;
  imageId: string | null;
  date: string | null;
}

interface VAMItemsInfo {
  version: string;
  record_count: number;
  record_count_exact: boolean;
  page_size: number;
  pages: number;
  page: number;
  image_count: number;
}

interface ArtSearchResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    va: VAMItem[];
    vaItemsInfo: VAMItemsInfo;
  };
}

interface VAMApiRecord {
  systemNumber: string;
  _primaryMaker?: {
    name: string;
  };
  _primaryTitle?: string;
  _primaryDate?: string;
  _images?: {
    _primary_thumbnail?: string;
    _iiif_image_base_url?: string;
  };
  _primaryImageId?: string;
}

export async function POST(req: Request) {
  try {
    const { query, makerId, start = 1 }: ArtSearchRequest = await req.json();

    // Validate input
    if (!query && !makerId) {
      return NextResponse.json<ArtSearchResponse>({
        status: 400,
        success: false,
        message: "Either query or makerId must be provided",
      });
    }

    let vaResponse;
    const params = { page: start };

    try {
      if (makerId) {
        vaResponse = await axios.get(
          `https://api.vam.ac.uk/v2/objects/search?id_person=${makerId}`,
          { params }
        );
      } else if (query) {
        vaResponse = await axios.get(
          "https://api.vam.ac.uk/v2/objects/search",
          {
            params: { q: query, page: start },
          }
        );
      }
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        // Handle errors in axios request
        console.error("API request error:", apiError.message);
        const status = apiError.response?.status || 500;
        return NextResponse.json<ArtSearchResponse>({
          status,
          success: false,
          message: `Failed to fetch data from the V&A API: ${apiError.message}`,
        });
      } else {
        // Handle other errors
        console.error("Unknown API error:", apiError);
        return NextResponse.json<ArtSearchResponse>({
          status: 500,
          success: false,
          message: "An unknown error occurred while fetching the data.",
        });
      }
    }

    // Check if response data exists
    if (!vaResponse || !vaResponse.data.records) {
      return NextResponse.json<ArtSearchResponse>({
        status: 404,
        success: false,
        message: "No data found for the given search criteria.",
      });
    }

    const vaItemsInfo: VAMItemsInfo = vaResponse.data.info;

    const vaItems: VAMItem[] = vaResponse.data.records.map(
      (record: VAMApiRecord) => ({
        id: record.systemNumber,
        searchSource: "va",
        maker: record._primaryMaker?.name || "Unknown",
        title: record._primaryTitle || "Untitled",
        thumbnailUrl:
          record._images?._primary_thumbnail || "/images/no_image.png",
        baseImageUrl: record._images?._iiif_image_base_url
          ? `${record._images._iiif_image_base_url}/full/full/0/default.jpg`
          : "/images/no_image.png",
        imageId: record._primaryImageId || null,
        date: record._primaryDate || null,
      })
    );

    return NextResponse.json<ArtSearchResponse>({
      status: 200,
      success: true,
      message: "Art retrieved successfully!",
      data: {
        va: vaItems,
        vaItemsInfo: vaItemsInfo,
      },
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json<ArtSearchResponse>({
      status: 500,
      success: false,
      message: "An internal server error occurred.",
    });
  }
}
