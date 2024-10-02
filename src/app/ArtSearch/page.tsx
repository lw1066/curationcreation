"use client";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import classes from "./artSearch.module.css";
import VaItemDisplay from "../components/FullItemCard";
import LoadMoreButton from "../components/LoadMoreButton";
import useCountAnimation from "../components/useCountAnimation";

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
  info: { record_count: 0; image_count: 0 };
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [makerId, setMakerId] = useState<string | null>(null);
  const [results, setResults] = useState<Results>({
    va: [],
    info: { record_count: 0, image_count: 0 },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fullItem, setFullItem] = useState<ArtItem | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
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

      const fetchedResults = response.data.data;

      // Update the results and pagination
      setResults((prevResults) => ({
        va:
          pageNum === 1
            ? fetchedResults.va
            : [...prevResults.va, ...fetchedResults.va],
        info: fetchedResults.info, // Add new results on pagination
      }));
      setHasMore(fetchedResults.va.length === 15); // Check if more results are available
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
    setResults({
      va: [],
      info: { record_count: 0, image_count: 0 },
    }); // Clear previous results
    setMakerId(null);

    await fetchSearchResults({
      searchQuery: query,
      searchMakerId: null,
      pageNum: 1,
    });
  };

  // Handle full info request for a specific item
  const handleFullInfoRequest = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/va-full-info", { id });

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
    setResults({
      va: [],
      info: { record_count: 0, image_count: 0 },
    });
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

  console.log(results);

  const animatedRecordCount = useCountAnimation(
    results.info.record_count || 0,
    2000
  );
  const animatedImageCount = useCountAnimation(
    results.info.image_count || 0,
    2000
  );

  return (
    <div>
      {fullItem && (
        <VaItemDisplay
          item={fullItem}
          close={closeFullItemDisplay}
          handleMakerSearch={handleMakerSearch}
        />
      )}
      <div className={classes.searchFormContainer}>
        <div className={classes.vaSearchInstructionsContainer}>
          <span className={classes.vaLogoContainer}>
            <Image
              className={classes.vaLogo}
              src={"/images/Victoria_and_Albert_Museum_Logo.svg"}
              alt="V and A logo"
              width={80}
              height={80}
            />
          </span>
          <p>
            The Victoria and Albert Museum catalogue has over 1 million items
            (500k images) covering 5000 years of human creativity!{" "}
          </p>
        </div>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter artist, place, type"
            required
            style={{ width: "65%" }}
          />

          <LoadMoreButton onClick={() => {}} text="Search" fontSize="12px" />
        </form>
        <div className={classes.filtersContainer}>
          <p>
            <span style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              {animatedRecordCount}
            </span>{" "}
            items found {"   "} with{" "}
            <span style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              {animatedImageCount}
            </span>{" "}
            images
          </p>
          <p style={{ fontWeight: "600", margin: "20px" }}>
            Filter your results
          </p>
          <input
            type="checkbox"
            id="onlyWithImages"
            checked={onlyWithImages}
            onChange={(e) => setOnlyWithImages(e.target.checked)} // Update checkbox state
          />
          <label htmlFor="onlyWithImages" style={{ marginLeft: "10px" }}>
            Only show items with images
          </label>
        </div>
      </div>

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
