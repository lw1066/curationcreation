import axios from "axios";

export const fetchVaSearchResults = async ({
  searchQuery,
  searchMakerId,
  pageNum,
}: {
  searchQuery: string | null;
  searchMakerId: string | null;
  pageNum: number;
}) => {
  try {
    const response = await axios.post("/api/art-search", {
      query: searchQuery,
      makerId: searchMakerId,
      start: pageNum,
      rows: 15,
    });

    const fetchedResults = response.data.data;

    return {
      va: fetchedResults.va,
      vaItemsInfo: fetchedResults.vaItemsInfo,
    };
  } catch (err) {
    throw new Error(`An error occurred: ${err}`);
  }
};

export const fetchEuropeanaResults = async (
  searchQuery: string | null,
  cursor: string | null
) => {
  try {
    const response = await axios.post("/api/europeana-search", {
      query: searchQuery,
      cursor: cursor || "*",
      rows: 10,
    });

    const fetchedResults = response.data.data;

    return {
      europeana: fetchedResults.europeana,
      EItemsInfo: fetchedResults.EItemsInfo,
      nextCursor: response.data.nextCursor ?? null,
    };
  } catch (err) {
    throw new Error(`An error occurred: ${err}`);
  }
};
