import axios from "axios";
import { NextResponse } from "next/server";

interface EuropeanaItem {
  id: string;
  searchSource: string;
  dcTitleLangAware: {
    [key: string]: string | string[] | undefined;
  };
  dcTitle?: string | string[];
  title?: string | string[];
  dcDescriptionLangAware?: {
    [key: string]: string | string[] | undefined;
  };
  dcDescription?: string | string[];
  description?: string | string[];
  dcCreatorLangAware?: {
    [key: string]: string | string[] | undefined;
  };
  dcCreator: string | string[];
  creator?: string | string[];
  dcSubjectLangAware?: {
    [key: string]: string | string[] | undefined;
  };
  dcSubject?: string | string[];
  subject?: string | string[];
  dataProvider?: string[];
  year?: string[];
  country?: string[];
  edmPreview?: string[];
  edmIsShownBy?: string[];
  edmIsShownAt?: string[];
  rights?: string[];

  completeness: number;
  language: string[];
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
      maker: string;
      dataProvider: string;
      date: string;
      country: string;
      baseImageUrl: string;
      fullImage?: string;
      sourceLink?: string;
      rights: string;
      subject: string | string[];
    }>;
    EItemsInfo: {
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

    const pageSize = 10;
    const filteredItems: EuropeanaItem[] = [];
    let nextCursor: string | null = cursor || "*";
    const EItemsInfo = {
      record_count: 0,
      image_count: 0,
    };

    // Function to fetch and filter items
    const fetchAndFilter = async (cursorMark: string | null) => {
      try {
        const params = {
          wskey: process.env.EUROPEANA_API_KEY,
          query: query,
          profile: "rich",
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

        const hasEnglishLanguage = (item: EuropeanaItem): boolean | void => {
          // Check if the language field contains ONLY "en"
          const isEnglishOnly =
            typeof item.language === "string"
              ? item.language === "en"
              : Array.isArray(item.language) &&
                item.language.length === 1 &&
                item.language[0] === "en";

          // If it's not "en" only, exit without returning
          // if (!isEnglishOnly) return;

          // Ensure the three required fields exist
          const hasTitle = !!item.title || !!item.dcTitle; // Check if dcTitleLangAware exists
          const hasCreator = !!item.dcCreator; // Check if dcCreator exists
          const hasDescription = !!item.description || !!item.dcDescription; // Check if dcDescriptionLangAware exists

          // Return true only if all three fields exist
          if (hasTitle && isEnglishOnly) {
            return true;
          }
        };

        console.log(response.data.items[0]);
        // Filter results based on completeness
        const newFilteredItems = response.data.items.filter(
          (item: EuropeanaItem) => {
            if (item.completeness < 3) return false;

            if (hasEnglishLanguage(item)) return true;

            // Check for English content in dcTitleLangAware and dcDescriptionLangAware
            const hasEnglishTitle = item.dcTitleLangAware?.en !== undefined;
            const hasEnglishDescription =
              item.dcDescriptionLangAware?.en !== undefined;

            // If no English content in title or description, immediately filter out the item
            if (!hasEnglishTitle || !hasEnglishDescription) return false;

            const lowercaseQuery = query.toLowerCase();

            const queryInDcCreator = item.dcCreator?.some((creator: string) =>
              creator.toLowerCase().includes(lowercaseQuery)
            );

            const queryInDcSubject = item.dcSubjectLangAware?.en?.some(
              (subject: string) =>
                subject.toLowerCase().includes(lowercaseQuery)
            );

            let queryInTitle = false;
            if (typeof item.title === "string") {
              queryInTitle = item.title.toLowerCase().includes(lowercaseQuery);
            } else if (Array.isArray(item.title)) {
              queryInTitle = item.title.some((titleString: string) =>
                titleString.toLowerCase().includes(lowercaseQuery)
              );
            }

            return queryInDcCreator || queryInDcSubject || queryInTitle;
          }
        );

        filteredItems.push(...newFilteredItems);

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

    console.log(filteredItems[1]);

    const items = filteredItems.map((item) => ({
      id: item.id,
      completeness: item.completeness,
      searchSource: "euro",
      //get title
      title: item.dcTitleLangAware?.en
        ? Array.isArray(item.dcTitleLangAware.en)
          ? `1 ${item.dcTitleLangAware.en[0]}` // Join array items with a space
          : `2 ${item.dcTitleLangAware.en}` // Use string directly
        : item.dcTitle
        ? Array.isArray(item.dcTitle)
          ? `3 ${item.dcTitle.join(" ")}` // Join array items with space
          : `4 ${item.dcTitle}` // Use string directly
        : item.title
        ? Array.isArray(item.title)
          ? `5 ${item.title.join(" ")}` // Join array items with a space
          : `6 ${item.title}` // Use string directly
        : " Untitled",
      //get description
      description: item.dcDescriptionLangAware?.en
        ? Array.isArray(item.dcDescriptionLangAware.en)
          ? `1 ${item.dcDescriptionLangAware.en.join(" ")}` // Join array items with space
          : `2 ${item.dcDescriptionLangAware.en}` // Use string directly
        : item.dcDescription
        ? Array.isArray(item.dcDescription)
          ? `3 ${item.dcDescription.join(" ")}` // Join array items with space
          : `4 ${item.dcDescription}` // Use string directly
        : item.description
        ? Array.isArray(item.description)
          ? `5 ${item.description.join(" ")}` // Join array items with a space
          : `6 ${item.description}` // Use string directly
        : "Not provided",
      //get maker
      maker: {
        name: item.dcCreatorLangAware?.en
          ? Array.isArray(item.dcCreatorLangAware.en)
            ? `1 ${item.dcCreatorLangAware.en.join(" ")}` // Join array items with space
            : `2 ${item.dcCreatorLangAware.en}` // Use string directly
          : item.dcCreator
          ? Array.isArray(item.dcCreator)
            ? `3 ${item.dcCreator.join(" ")}` // Join array items with space
            : `4 ${item.dcCreator}` // Use string directly
          : item.creator
          ? Array.isArray(item.creator)
            ? `5 ${item.creator.join(" ")}` // Join array items with a space
            : `6 ${item.creator}` // Use string directly
          : "Not provided",
      },
      //get subject
      subject: item.dcSubjectLangAware?.en
        ? Array.isArray(item.dcSubjectLangAware.en)
          ? `1 ${item.dcSubjectLangAware.en.join(" | ")}` // Join array items with space
          : `2 ${item.dcSubjectLangAware.en}` // Use string directly
        : item.dcSubject
        ? Array.isArray(item.dcSubject)
          ? `3 ${item.dcSubject.join(" | ")}` // Join array items with space
          : `4 ${item.dcSubject}` // Use string directly
        : item.subject
        ? Array.isArray(item.subject)
          ? `5 ${item.subject.join(" | ")}` // Join array items with a space
          : `6 ${item.subject}` // Use string directly
        : "Not provided",
      dataProvider: item.dataProvider?.[0] || "Unknown provider",
      date: item.year
        ? Array.isArray(item.year)
          ? `1 ${item.year.join(" - ")}`
          : `2 ${item.year}`
        : "Not provided",
      country: item.country?.[0] || "Not provided",
      baseImageUrl: item.edmPreview?.[0] || "/No_Image_Available.jpg",
      fullImage: item.edmIsShownBy?.[0],
      sourceLink: item.edmIsShownAt?.[0],
      rights: item.rights?.[0] || "Unknown rights",
    }));

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Art retrieved!",
      data: {
        europeana: items,
        EItemsInfo: EItemsInfo,
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
        EItemsInfo: {
          record_count: 0,
          image_count: 0,
        },
      },
      nextCursor: undefined,
    });
  }
}
