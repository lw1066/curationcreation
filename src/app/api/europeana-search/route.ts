import axios from "axios";
import { NextResponse } from "next/server";

interface EuropeanaItem {
  id: string;
  searchSource: string;
  title: string;
  dcDescriptionLangAware?: {
    en?: string[];
  };
  dataProvider?: string[];
  year?: string[];
  country?: string[];
  edmPreview?: string[];
  edmIsShownBy?: string[];
  edmIsShownAt?: string[];
  rights?: string[];
  edmTimespanLabel?: {
    def: string;
  }[];
}

interface ApiResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    europeana: Array<{
      id: string;
      title: string;
      description: string;
      dataProvider: string;
      year: string;
      country: string;
      baseImageUrl: string;
      fullImage?: string;
      sourceLink?: string;
      rights: string;
      timespan: string;
    }>;
    info: {
      record_count: number;
      image_count: number;
    };
  };

  nextCursor?: string;
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const { query, cursor }: { query: string; cursor?: string } =
      await req.json();
    console.log("Received query:", query, cursor);

    const pageSize = 10;
    const filteredItems: EuropeanaItem[] = [];
    let nextCursor: string | null = cursor || "*";
    const EItemsInfo = {
      record_count: 0,
      image_count: 0,
    };

    // Function to fetch and filter items (using function expression)
    const fetchAndFilter = async (cursorMark: string | null) => {
      try {
        const params = {
          wskey: process.env.EUROPEANA_API_KEY,
          query: query,
          type: "IMAGE",
          rows: pageSize,
          cursor: cursorMark,
        };

        const response = await axios.get(
          "https://api.europeana.eu/record/v2/search.json",
          { params }
        );
        EItemsInfo.record_count = response.data.totalResults;
        EItemsInfo.image_count = response.data.totalResults;

        // Filter results based on description length
        const newFilteredItems = response.data.items.filter(
          (item: EuropeanaItem) => {
            return item;
          }
        );

        filteredItems.push(...newFilteredItems);

        // console.log(response.data.nextCursor);
        nextCursor = response.data.nextCursor || null;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Data fetch error");
      }
    };

    while (filteredItems.length < 10) {
      await fetchAndFilter(nextCursor);

      if (!nextCursor) {
        break;
      }
    }

    const items = filteredItems.map((item) => ({
      id: item.id,
      searchSource: "euro",
      title: item.title[0] || "No title",
      description:
        item.dcDescriptionLangAware && item.dcDescriptionLangAware.en
          ? item.dcDescriptionLangAware.en[0]
          : "No description available",
      dataProvider: item.dataProvider?.[0] || "Unknown provider",
      year: item.year?.[0] || "Unknown year",
      country: item.country?.[0] || "Unknown country",
      baseImageUrl: item.edmPreview?.[0] || "/No_Image_Available.jpg",
      fullImage: item.edmIsShownBy?.[0],
      sourceLink: item.edmIsShownAt?.[0],
      rights: item.rights?.[0] || "Unknown rights",
      timespan: item.edmTimespanLabel?.[0]?.def || "Unknown period",
    }));

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Art retrieved!",
      data: {
        europeana: items,
        info: EItemsInfo,
      },

      nextCursor: nextCursor,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to fetch data from Europeana API",
      data: {
        europeana: [],
        info: {
          record_count: 0,
          image_count: 0,
        },
      },

      nextCursor: undefined,
    });
  }
}
