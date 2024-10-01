"use client";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import classes from "./artSearch.module.css";
import VaItemDisplay from "../components/FullItemCard";
import LoadMoreButton from "../components/LoadMoreButton";

interface Maker {
  name: string;
  id?: string;
}

interface ArtItem {
  id: string;
  title: string;
  maker: Maker[];
  date: string;
  baseImageUrl: string;
}

interface Results {
  va: ArtItem[];
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [makerId, setMakerId] = useState<string | null>(null);
  const [results, setResults] = useState<Results>({ va: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fullItem, setFullItem] = useState<ArtItem | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [onlyWithImages, setOnlyWithImages] = useState<boolean>(false);

  const fetchSearchResults = async ({
    searchQuery,
    searchMakerId,
    pageNum,
  }: {
    searchQuery: string | null;
    searchMakerId: string | null;
    pageNum: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/art-search", {
        query: searchQuery,
        makerId: searchMakerId,
        start: pageNum,
        rows: 15,
      });

      const fetchedResults = response.data.data.va;

      // Update the results and pagination
      setResults((prevResults) => ({
        va:
          pageNum === 1
            ? fetchedResults
            : [...prevResults.va, ...fetchedResults], // Add new results on pagination
      }));
      setHasMore(fetchedResults.length === 15); // Check if more results are available
    } catch (err) {
      setError(`An error occurred: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    setResults({ va: [] }); // Clear previous results
    setMakerId(null);

    fetchSearchResults({ searchQuery: query, searchMakerId: null, pageNum: 1 });
  };

  // Handle full info request for a specific item
  const handleFullInfoRequest = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/va-full-info", { id });
      console.log(response.data.data.vaFullItem);
      setFullItem(response.data.data.vaFullItem);
    } catch (err) {
      setError(`An error occurred: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle maker search by maker_id
  const handleMakerSearch = async (makerId: string) => {
    setPage(1);
    setResults({ va: [] });
    setMakerId(makerId);

    fetchSearchResults({
      searchQuery: null,
      searchMakerId: makerId,
      pageNum: 1,
    });
  };

  // Close full item display modal
  const closeFullItemDisplay = () => {
    setFullItem(null);
  };

  // Handle loading more results (pagination)
  const loadMoreResults = async () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    setPage(nextPage); // Increment page number

    // Call the search function for pagination with the current query or maker_id
    if (makerId) {
      fetchSearchResults({
        searchQuery: null,
        searchMakerId: makerId,
        pageNum: nextPage,
      });
    } else {
      fetchSearchResults({
        searchQuery: query,
        searchMakerId: null,
        pageNum: nextPage,
      });
    }
  };

  const filteredResults = onlyWithImages
    ? results.va.filter(
        (item) =>
          item.baseImageUrl && item.baseImageUrl !== "/images/no_image.png"
      )
    : results.va;

  return (
    <div>
      {fullItem && (
        <VaItemDisplay
          item={fullItem}
          close={closeFullItemDisplay}
          handleMakerSearch={handleMakerSearch}
        />
      )}
      <h1>Victoria & Albert Museum Art Search</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
          required
        />
        <button type="submit">Search</button>
      </form>

      <label>
        <input
          type="checkbox"
          checked={onlyWithImages}
          onChange={(e) => setOnlyWithImages(e.target.checked)} // Update checkbox state
        />
        Only show items with images
      </label>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <div>
        {filteredResults.length > 0 && (
          <div className={classes.resultsGrid}>
            {filteredResults.map((item) => (
              <div className={classes.itemCard} key={item.id}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "200px",
                  }}
                >
                  <Image
                    src={
                      item.baseImageUrl === "/images/no_image.png"
                        ? "/images/no_image.png"
                        : `${item.baseImageUrl}/full/full/0/default.jpg`
                    }
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizes for better performance
                    quality={100}
                    style={{ objectFit: "contain" }}
                    alt={item.title}
                    onClick={() => handleFullInfoRequest(item.id)}
                  />
                </div>
                <p className={classes.title}>{item.title}</p>
                <p className={classes.info}>{item.maker[0].name}</p>
                <p className={classes.info}>{item.date}</p>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <LoadMoreButton onClick={loadMoreResults} disabled={loading} />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
