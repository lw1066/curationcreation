import axios from "axios";
import { NextResponse } from "next/server";
import { Item } from "../../types";
import sanitizeHtml from "sanitize-html";

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
    europeana: Item[];

    EItemsInfo: {
      record_count: number;
      image_count: number;
    };
  };

  nextCursor?: string;
}

const sanitizeHTML = (htmlString: string): string => {
  return sanitizeHtml(htmlString, {
    allowedTags: ["i", "em", "b", "strong", "br", "p"],
    allowedAttributes: {}, // Add allowed attributes if needed
  });
};

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
          const isEnglishOnly =
            typeof item.language === "string"
              ? item.language === "en"
              : Array.isArray(item.language) &&
                item.language.length === 1 &&
                item.language[0] === "en";

          const hasTitle = !!item.title || !!item.dcTitle;

          if (hasTitle && isEnglishOnly) {
            return true;
          }
        };

        // console.log(response.data.items[0]);

        const newFilteredItems = response.data.items.filter(
          (item: EuropeanaItem) => {
            if (item.completeness < 3) return false;

            if (hasEnglishLanguage(item)) return true;

            const hasEnglishTitle = item.dcTitleLangAware?.en !== undefined;
            const hasEnglishDescription =
              item.dcDescriptionLangAware?.en !== undefined;

            if (!hasEnglishTitle || !hasEnglishDescription) return false;

            const lowercaseQuery = query.toLowerCase();

            const queryInDcCreator = Array.isArray(item.dcCreator)
              ? item.dcCreator.some((creator: string) =>
                  creator.toLowerCase().includes(lowercaseQuery)
                )
              : item.dcCreator?.toLowerCase().includes(lowercaseQuery);

            const queryInDcSubject = Array.isArray(item.dcSubjectLangAware?.en)
              ? item.dcSubjectLangAware.en.some((subject: string) =>
                  subject.toLowerCase().includes(lowercaseQuery)
                )
              : typeof item.dcSubjectLangAware?.en === "string"
              ? item.dcSubjectLangAware.en
                  .toLowerCase()
                  .includes(lowercaseQuery)
              : false;

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

    // console.log(filteredItems[1]);

    const items = filteredItems.map((item) => ({
      id: item.id,
      completeness: item.completeness,
      searchSource: "euro",
      //get title
      title: sanitizeHTML(
        item.dcTitleLangAware?.en
          ? Array.isArray(item.dcTitleLangAware.en)
            ? item.dcTitleLangAware.en[0]
            : item.dcTitleLangAware.en
          : item.dcTitle
          ? Array.isArray(item.dcTitle)
            ? item.dcTitle.join(" ")
            : item.dcTitle
          : item.title
          ? Array.isArray(item.title)
            ? item.title.join(" ")
            : item.title
          : " Untitled"
      ),
      //get description
      description: sanitizeHTML(
        item.dcDescriptionLangAware?.en
          ? Array.isArray(item.dcDescriptionLangAware.en)
            ? item.dcDescriptionLangAware.en.join(" ")
            : item.dcDescriptionLangAware.en
          : item.dcDescription
          ? Array.isArray(item.dcDescription)
            ? item.dcDescription.join(" ")
            : item.dcDescription
          : item.description
          ? Array.isArray(item.description)
            ? item.description.join(" ")
            : item.description
          : "Not provided"
      ),
      //get maker
      maker: [
        {
          name: item.dcCreatorLangAware?.en
            ? Array.isArray(item.dcCreatorLangAware.en)
              ? item.dcCreatorLangAware.en.join(" ")
              : item.dcCreatorLangAware.en
            : item.dcCreator
            ? Array.isArray(item.dcCreator)
              ? item.dcCreator.join(" ")
              : item.dcCreator
            : item.creator
            ? Array.isArray(item.creator)
              ? item.creator.join(" ")
              : item.creator
            : "Not provided",
        },
      ],
      //get subject
      subject: item.dcSubjectLangAware?.en
        ? Array.isArray(item.dcSubjectLangAware.en)
          ? item.dcSubjectLangAware.en.join(" | ")
          : item.dcSubjectLangAware.en
        : item.dcSubject
        ? Array.isArray(item.dcSubject)
          ? item.dcSubject.join(" | ")
          : item.dcSubject
        : item.subject
        ? Array.isArray(item.subject)
          ? item.subject.join(" | ")
          : item.subject
        : "Not provided",
      dataProvider: item.dataProvider?.[0] || "Not provided",
      date: item.year
        ? Array.isArray(item.year)
          ? item.year.join(" - ")
          : item.year
        : "Not provided",
      country: item.country?.[0] || "Not provided",
      baseImageUrl: item.edmPreview?.[0] || "/No_Image_Available.jpg",
      fullImage: item.edmIsShownBy?.[0],
      sourceLink: item.edmIsShownAt?.[0],
      rights: item.rights?.[0] || "Unknown rights",
      imagesCount: 1,
    }));

    console.log(items);

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
