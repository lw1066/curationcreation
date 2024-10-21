"use client";
import { useState } from "react";
import Image from "next/image";
import classes from "./artSearch.module.css";
import FullItemCard from "../components/FullItemCard";
import LoadMoreButton from "../components/LoadMoreButton";
import useCountAnimation from "../components/useCountAnimation";
import { Item, Results, ArtItem } from "../types";
import { fetchFullInfo } from "../utils/fetchFullInfo";
import {
  fetchEuropeanaResults,
  fetchVaSearchResults,
} from "../utils/apiFetches";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Results>({
    va: [],
    europeana: [],
    info: { record_count: 0, image_count: 0 },
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [fullItem, setFullItem] = useState<Item | null>(null);
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
      setLoading(true);
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
      setLoading(false);
    }

    // Handle Europeana-only search
    else if (searchType === "europeana") {
      setLoading(true);
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
      setLoading(false);
    }

    // Handle Both VA and Europeana search
    else if (searchType === "both") {
      setLoading(true);

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
      setLoading(false);
    }
  };

  const handleFullInfoRequest = async (item: ArtItem) => {
    setLoading(true);
    setError(null);
    let fullItem;

    if (item.searchSource === "va") {
      fullItem = await fetchFullInfo(item.id);
    }

    if (item.searchSource === "euro") {
      fullItem = {
        id: item.id,
        searchSource: "euro",
        title: item.title,
        maker: item.maker?.name,
        date: item.date || "unknown",
        baseImageUrl: item.baseImageUrl || "/No_Image_Available.jpg",
        description: item.description,
        provider: item.dataProvider,
        physicalDescription: "Not provided",
        subject: item.subject,
        materials: [],
        techniques: [],
        placesOfOrigin: [],
        productionDates: [],
        imageUrls: [item.baseImageUrl],
        imagesCount: 1,
        briefDescription: "Not provided",
        country: item.country,
        sourceLink: item.sourceLink,
      };
    }

    console.log("here");
    setFullItem(fullItem);
    setLoading(false);
  };

  const handleMakerSearch = async (makerId: string) => {
    setVaPage(1);
    setEuropeanaCursor(null);
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0 },
    });
    setLoading(true);
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

    setLoading(false);
  };

  const closeFullItemDisplay = () => {
    setFullItem(null);
  };

  const loadMoreResults = async () => {
    if (!hasMore || loading) return;

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
      setLoading(true);
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
        setLoading(false);
      }
    }

    if (
      (searchType === "europeana" || searchType === "both") &&
      europeanaCursor
    ) {
      setLoading(true);
      try {
        newEuropeanaResults = await fetchEuropeanaResults(
          query,
          europeanaCursor
        );

        setEuropeanaCursor(newEuropeanaResults.nextCursor || null);
        moreEuropeanaResults = !!newEuropeanaResults.nextCursor;
      } finally {
        setLoading(false);
      }
    }

    setResults((prevResults) => ({
      va: [...prevResults.va, ...prevResults.europeana, ...newVaResults.va],
      europeana: [...newEuropeanaResults.europeana],
      info: prevResults.info,
    }));

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
          {console.log("295 in artSearch:::::", fullItem)}
          <FullItemCard
            item={fullItem}
            close={closeFullItemDisplay}
            handleMakerSearch={handleMakerSearch}
          />
        </>
      )}
      <div className={classes.searchFormContainer}>
        <div className={classes.searchInstructionsContainer}>
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
            placeholder="Enter artist, place, object..."
            required
            style={{ width: "65%", marginBottom: "20px", fontSize: "1.25rem" }}
          />
          <div className={classes.searchInstructionsContainer}>
            <p>Choose your collection(s)</p>
            <p>
              The Victoria and Albert Museum - Over 1m items spanning 5000
              years!
            </p>
            <p>
              Europeana - Over 32m images from 2000 European cultural
              institutions!
            </p>
          </div>

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
                style={{ marginTop: "7px" }}
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
        {loading && (
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
        {hasMore && !loading && (
          <LoadMoreButton onClick={loadMoreResults} disabled={loading} />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
