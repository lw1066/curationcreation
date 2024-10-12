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
  maker: Maker;
  date: string;
  baseImageUrl: string;
  imageUrl?: string; // Optional for Europeana items
}

interface Material {
  text: string;
  id: string;
}

interface ImageMeta {
  assetRef: string; // Reference to the image asset
}

interface Technique {
  text: string;
  id: string;
}

interface fullVaItem {
  id: string;
  title: string;
  maker: Maker[];
  date: string;
  baseImageUrl: string;
  description: string;
  physicalDescription: string;
  materials: Material[];
  techniques: Technique[];
  placesOfOrigin?: {
    place: { text: string; id?: string };
    association: { text: string };
  }[];
  productionDates?: {
    date: { text: string };
    association: { text: string };
  }[];
  images?: {
    _iiif_image: string;
    imagesMeta?: ImageMeta[];
  };
  briefDescription: string;
}

interface Results {
  va: ArtItem[];
  europeana: ArtItem[]; // Add Europeana results
  info: { record_count: number; image_count: number };
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [makerId, setMakerId] = useState<string | null>(null);
  const [results, setResults] = useState<Results>({
    va: [],
    europeana: [],
    info: { record_count: 0, image_count: 0 },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fullItem, setFullItem] = useState<fullVaItem | null>(null);
  const [vaPage, setVaPage] = useState<number>(1); // For VA pagination
  const [europeanaCursor, setEuropeanaCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [onlyWithImages, setOnlyWithImages] = useState<boolean>(false);
  const [imageLoadingStatus, setImageLoadingStatus] = useState<{
    [id: string]: boolean;
  }>({});
  const [searchSource, setSearchSource] = useState<"va" | "europeana" | "both">(
    "va"
  );

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
        ...prevResults,
        va:
          pageNum === 1
            ? fetchedResults.va
            : [...prevResults.va, ...fetchedResults.va],
        info: fetchedResults.info,
      }));
      setHasMore(fetchedResults.va.length === 15); // Check if more results are available
    } catch (err) {
      setError(`An error occurred: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Europeana results
  const fetchEuropeanaResults = async (
    searchQuery: string | null,
    cursor: string | null
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/europeana-search", {
        query: searchQuery,
        cursor: cursor || "*", // Default cursor value if null
        rows: 10,
      });

      const fetchedResults = response.data.data;
      console.log(response.data.nextCursor);

      setResults((prevResults) => ({
        ...prevResults,
        europeana:
          europeanaCursor === null
            ? fetchedResults.europeana // On first page, replace
            : [...prevResults.europeana, ...fetchedResults.europeana], // On subsequent pages, append
        info: fetchedResults.info,
      }));

      if (response.data.nextCursor) {
        setEuropeanaCursor(response.data.nextCursor); // Update cursor for next pagination
        setHasMore(true);
      } else {
        setEuropeanaCursor(null); // No more results
        setHasMore(false); // Disable load more button
      }
    } catch (err) {
      setError(`An error occurred: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVaPage(1); // Reset to first page for VA
    setEuropeanaCursor(null); // Reset cursor for Europeana
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0 },
    }); // Clear previous results
    setMakerId(null);

    if (searchSource === "va") {
      await fetchSearchResults({
        searchQuery: query,
        searchMakerId: null,
        pageNum: 1,
      });
    } else if (searchSource === "europeana") {
      await fetchEuropeanaResults(query, null);
    } else if (searchSource === "both") {
      await Promise.all([
        fetchSearchResults({
          searchQuery: query,
          searchMakerId: null,
          pageNum: 1,
        }),
        fetchEuropeanaResults(query, null),
      ]);
    }
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
    setVaPage(1);
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0 },
    });
    setMakerId(makerId);

    await fetchSearchResults({
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

    const nextPage = vaPage + 1;
    setVaPage(nextPage); // Increment page number

    if (searchSource === "va") {
      await fetchSearchResults({
        searchQuery: query,
        searchMakerId: null,
        pageNum: nextPage,
      });
    } else if (searchSource === "europeana") {
      await fetchEuropeanaResults(query, europeanaCursor);
    } else if (searchSource === "both") {
      await Promise.all([
        fetchSearchResults({
          searchQuery: query,
          searchMakerId: null,
          pageNum: nextPage,
        }),
        fetchEuropeanaResults(query, europeanaCursor),
      ]);
    }
  };

  const filteredResults = onlyWithImages
    ? [...results.va, ...results.europeana].filter(
        (item) =>
          item.baseImageUrl && item.baseImageUrl !== "/images/no_image.png"
      )
    : [...results.va, ...results.europeana];

  console.log(results);

  const animatedRecordCount = useCountAnimation(
    results.info.record_count || 0,
    3000
  );
  const animatedImageCount = useCountAnimation(
    results.info.image_count || 0,
    3000
  );

  const handleImageLoad = (id: string) => {
    setImageLoadingStatus((prevState) => ({
      ...prevState,
      [id]: false,
    }));
  };

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
            (500k images) covering 5000 years of human creativity!
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
            style={{ width: "65%", marginBottom: "20px" }}
          />

          <div>
            <button
              type="button"
              onClick={() => setSearchSource("va")}
              className={searchSource === "va" ? classes.activeButton : ""}
            >
              VA Search
            </button>
            <button
              type="button"
              onClick={() => setSearchSource("europeana")}
              className={
                searchSource === "europeana" ? classes.activeButton : ""
              }
            >
              Europeana Search
            </button>
            <button
              type="button"
              onClick={() => setSearchSource("both")}
              className={searchSource === "both" ? classes.activeButton : ""}
            >
              Both
            </button>
          </div>

          <LoadMoreButton
            onClick={() => {}}
            text="Search"
            fontSize="14px"
            width="55px"
            height="55px"
          />
        </form>
        {results.info.record_count > 0 && (
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

            <input
              type="checkbox"
              id="onlyWithImages"
              checked={onlyWithImages}
              onChange={(e) => setOnlyWithImages(e.target.checked)}
            />
            <label htmlFor="onlyWithImages" style={{ marginLeft: "10px" }}>
              Only show items with images
            </label>
          </div>
        )}
      </div>

      {loading && (
        <div className={classes.spinnerContainer}>
          <div className={classes.spinner}></div>
        </div>
      )}
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
                  {imageLoadingStatus[item.id] !== false && (
                    <div className={classes.spinnerContainer}>
                      <div className={classes.spinner}></div>
                    </div>
                  )}

                  <Image
                    src={
                      item.baseImageUrl &&
                      item.baseImageUrl !== "/images/no_image.png"
                        ? item.baseImageUrl
                        : "/images/no_image.png"
                    }
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={100}
                    style={{ objectFit: "contain" }}
                    alt={item.title}
                    onLoad={() => handleImageLoad(item.id)}
                    onClick={() => handleFullInfoRequest(item.id)}
                  />
                </div>
                <p className={classes.title}>{item.title}</p>
                <p className={classes.info}>{item.maker?.name}</p>
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
