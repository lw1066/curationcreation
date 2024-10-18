"use client";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import classes from "./artSearch.module.css";
import FullItemCard from "../components/FullItemCard";
import LoadMoreButton from "../components/LoadMoreButton";
import useCountAnimation from "../components/useCountAnimation";
import { fullItem, Results, ArtItem } from "../types";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  // const [makerId, setMakerId] = useState<string | null>(null);
  const [results, setResults] = useState<Results>({
    va: [],
    europeana: [],
    info: { record_count: 0, image_count: 0 },
  });
  const [vaLoading, setVaLoading] = useState<boolean>(false);
  const [euroLoading, setEuroLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fullItem, setFullItem] = useState<fullItem | null>(null);
  const [vaPage, setVaPage] = useState<number>(1); // For VA pagination
  const [europeanaCursor, setEuropeanaCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [onlyWithImages, setOnlyWithImages] = useState<boolean>(false);
  const [imageLoadingStatus, setImageLoadingStatus] = useState<{
    [id: string]: boolean;
  }>({});
  const [searchType, setSearchType] = useState<"va" | "europeana" | "both">(
    "va"
  );
  const [makerId, setMakerId] = useState<string | null>(null);

  const fetchVaSearchResults = async ({
    searchQuery,
    searchMakerId,
    pageNum,
  }: {
    searchQuery: string | null;
    searchMakerId: string | null;
    pageNum: number;
  }) => {
    setVaLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/art-search", {
        query: searchQuery,
        makerId: searchMakerId,
        start: pageNum,
        rows: 15,
      });

      const fetchedResults = response.data.data;

      // Return the fetched results to be handled in handleSubmit
      return {
        va: fetchedResults.va,
        vaItemsInfo: fetchedResults.vaItemsInfo,
      };
    } catch (err) {
      setError(`An error occurred: ${err}`);
      return { va: [], vaItemsInfo: { record_count: 0, image_count: 0 } };
    } finally {
      setVaLoading(false);
    }
  };

  // Fetch Europeana results
  const fetchEuropeanaResults = async (
    searchQuery: string | null,
    cursor: string | null
  ) => {
    setEuroLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/europeana-search", {
        query: searchQuery,
        cursor: cursor || "*",
        rows: 10,
      });

      const fetchedResults = response.data.data;

      // Return the fetched results to be handled in handleSubmit
      return {
        europeana: fetchedResults.europeana,
        EItemsInfo: fetchedResults.EItemsInfo,
        nextCursor: response.data.nextCursor ?? null,
      };
    } catch (err) {
      setError(`An error occurred: ${err}`);
      return {
        europeana: [],
        EItemsInfo: { record_count: 0, image_count: 0 },
        nextCursor: null,
      };
    } finally {
      setEuroLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVaPage(1);
    setEuropeanaCursor(null);
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0 },
    });

    setMakerId(null);

    if (searchType === "va") {
      const vaResults = await fetchVaSearchResults({
        searchQuery: query,
        searchMakerId: null,
        pageNum: 1,
      });

      const moreVaResults =
        vaResults.vaItemsInfo?.record_count > vaResults.va.length;

      setResults({
        va: vaResults.va,
        europeana: [],
        info: {
          record_count: vaResults.vaItemsInfo?.record_count || 0,
          image_count: vaResults.vaItemsInfo?.image_count || 0,
        },
      });
      setHasMore(moreVaResults);
    }

    // Handle Europeana-only search
    else if (searchType === "europeana") {
      const europeanaResults = await fetchEuropeanaResults(query, null);

      const moreEuropeanaResults = !!europeanaResults.nextCursor;
      setEuropeanaCursor(europeanaResults.nextCursor);

      setResults({
        va: [],
        europeana: europeanaResults.europeana,
        info: {
          record_count: europeanaResults.EItemsInfo?.record_count || 0,
          image_count: europeanaResults.EItemsInfo?.image_count || 0,
        },
      });
      setHasMore(moreEuropeanaResults);
    }

    // Handle Both VA and Europeana search
    else if (searchType === "both") {
      const [vaResults, europeanaResults] = await Promise.all([
        fetchVaSearchResults({
          searchQuery: query,
          searchMakerId: null,
          pageNum: 1,
        }),
        fetchEuropeanaResults(query, null),
      ]);

      const moreVaResults =
        vaResults.vaItemsInfo?.record_count > vaResults.va.length;
      const moreEuropeanaResults = !!europeanaResults.nextCursor;
      setEuropeanaCursor(europeanaResults.nextCursor);

      setResults({
        va: vaResults.va,
        europeana: europeanaResults.europeana,
        info: {
          record_count:
            (vaResults.vaItemsInfo?.record_count || 0) +
            (europeanaResults.EItemsInfo?.record_count || 0),
          image_count:
            (vaResults.vaItemsInfo?.image_count || 0) +
            (europeanaResults.EItemsInfo?.image_count || 0),
        },
      });
      setHasMore(moreVaResults || moreEuropeanaResults);
    }
  };

  const handleFullInfoRequest = async (item: ArtItem) => {
    setError(null);

    if (item.searchSource === "va") {
      setVaLoading(true);
      const id = item.id;
      try {
        const response = await axios.post("/api/va-full-info", { id });

        setFullItem(response.data.data.vaFullItem);
      } catch (err) {
        setError(`An error occurred: ${err}`);
      } finally {
        setVaLoading(false);
      }
    } else if (item.searchSource === "euro") {
      setEuroLoading(true);
      const fullEuroItem = {
        id: item.id,
        searchSource: "euro",
        title: item.title,
        maker: [{ name: "Europeana does not provide maker" }],
        date: item.date || "unknown",
        baseImageUrl: item.baseImageUrl || "/No_Image_Available.jpg",
        backupImageUrl: item.baseImageUrl,
        description: `Item provided by ${item.dataProvider}. ${item.description}`,
        physicalDescription: "Not provided",
        materials: [],
        techniques: [],
        placesOfOrigin: [],
        productionDates: [],
        images: {
          _iiif_image: item.fullImage || "/images/no_image.png",
        },
        briefDescription: "Not provided by Europenana",
      };
      setFullItem(fullEuroItem);
      setEuroLoading(false);
    }
  };

  const handleMakerSearch = async (makerId: string) => {
    setVaPage(1);
    setEuropeanaCursor(null);
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0 },
    });
    setVaLoading(true);
    setError(null);
    setMakerId(makerId);

    const vaResults = await fetchVaSearchResults({
      searchQuery: null,
      searchMakerId: makerId,
      pageNum: 1,
    });

    setResults({
      va: vaResults.va,
      europeana: [],
      info: {
        record_count: vaResults.vaItemsInfo?.record_count || 0,
        image_count: vaResults.vaItemsInfo?.image_count || 0,
      },
    });

    setVaLoading(false);
  };

  const closeFullItemDisplay = () => {
    setFullItem(null);
  };

  const loadMoreResults = async () => {
    if (!hasMore || vaLoading || euroLoading) return;

    setError(null);

    let newVaResults = {
      va: [],
      vaItemsInfo: { record_count: 0, image_count: 0 },
    };
    let newEuropeanaResults = {
      europeana: [],
      EItemsInfo: { record_count: 0, image_count: 0 },
      nextCursor: null,
    };

    let moreVaResults = false;
    let moreEuropeanaResults = false;

    // Fetch VA results if VA or Both are selected
    if (
      (searchType === "va" || searchType === "both") &&
      results.va.length < results.info.record_count
    ) {
      setVaLoading(true);
      try {
        const nextPage = vaPage + 1;
        setVaPage(nextPage);

        newVaResults = await fetchVaSearchResults({
          searchQuery: query,
          searchMakerId: makerId,
          pageNum: nextPage,
        });

        moreVaResults =
          results.info.record_count >
          results.va.length + newVaResults.va.length;
      } finally {
        setVaLoading(false);
      }
    }

    // Fetch Europeana results if Europeana or Both are selected
    if (
      (searchType === "europeana" || searchType === "both") &&
      europeanaCursor
    ) {
      setEuroLoading(true); // Set loading to true before fetching
      try {
        newEuropeanaResults = await fetchEuropeanaResults(
          query,
          europeanaCursor
        );

        setEuropeanaCursor(newEuropeanaResults.nextCursor || null);
        moreEuropeanaResults = !!newEuropeanaResults.nextCursor;
      } finally {
        setEuroLoading(false); // Ensure loading is stopped after fetching
      }
    }
    // Update results to append new VA first, then new Europeana
    setResults((prevResults) => ({
      va: [...prevResults.va, ...prevResults.europeana, ...newVaResults.va], // Old VA + Old Europeana + New VA
      europeana: [...newEuropeanaResults.europeana], // Append new Europeana after new VA
      info: prevResults.info, // Info remains unchanged
    }));

    // Update hasMore based on whether either source has more results
    setHasMore(moreVaResults || moreEuropeanaResults);
  };

  const filteredResults = onlyWithImages
    ? [...results.va, ...results.europeana].filter(
        (item) =>
          item.baseImageUrl && item.baseImageUrl !== "/images/no_image.png"
      )
    : [...results.va, ...results.europeana];

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
      {error && <p>{error}</p>}
      {fullItem && (
        <>
          {console.log(fullItem)}
          <FullItemCard
            item={fullItem}
            close={closeFullItemDisplay}
            handleMakerSearch={handleMakerSearch}
          />
        </>
      )}
      <div className={classes.searchFormContainer}>
        <div className={classes.vaSearchInstructionsContainer}>
          <p>
            Enter a search term and choose either collection or both to search
            for items.
          </p>
          <p>
            The search term can be anything! An artist, a place, an object - see
            what you find!
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

          <div style={{ display: "flex", gap: "20px" }}>
            <div
              onClick={() => {
                setSearchType((prevType) =>
                  prevType === "va"
                    ? "europeana"
                    : prevType === "europeana"
                    ? "both"
                    : "va"
                );
              }}
              style={{ cursor: "pointer" }}
              className={`${classes.searchLogoContainer} ${
                searchType === "va" || searchType === "both"
                  ? classes.activeImage
                  : ""
              }`}
            >
              <Image
                src="/images/Victoria_and_Albert_Museum_Logo.svg"
                alt="VA Search"
                width={45}
                height={45}
              />
            </div>

            <div
              onClick={() => {
                setSearchType((prevType) =>
                  prevType === "europeana"
                    ? "va"
                    : prevType === "va"
                    ? "both"
                    : "europeana"
                );
              }}
              style={{ cursor: "pointer" }}
              className={`${classes.searchLogoContainer} ${
                searchType === "europeana" || searchType === "both"
                  ? classes.activeImage
                  : ""
              }`}
            >
              <Image
                src="/images/euroLogo.png"
                alt="Europeana Search"
                width={45}
                height={45}
              />
            </div>
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

            {searchType != "europeana" && (
              <>
                <input
                  type="checkbox"
                  id="onlyWithImages"
                  checked={onlyWithImages}
                  onChange={(e) => setOnlyWithImages(e.target.checked)}
                />
                <label htmlFor="onlyWithImages" style={{ marginLeft: "10px" }}>
                  Only show items with images
                </label>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        {(vaLoading || euroLoading) && (
          <div className={classes.fetchSpinnerContainer}>
            <div className={classes.spinner}></div>
          </div>
        )}
        {filteredResults.length > 0 && (
          <div className={classes.resultsGrid}>
            {filteredResults.map((item) => {
              // console.log("item in filterfunction----", item);
              return (
                <div className={classes.itemCard} key={item.id}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "200px",
                    }}
                  >
                    {imageLoadingStatus[item.id] !== false && (
                      <div className={classes.imageSpinnerContainer}>
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
                      onClick={() => handleFullInfoRequest(item)}
                    />
                  </div>
                  <p className={classes.title}>{item.title}</p>
                </div>
              );
            })}
          </div>
        )}
        {hasMore && !vaLoading && !euroLoading && (
          <LoadMoreButton
            onClick={loadMoreResults}
            disabled={vaLoading || euroLoading}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
