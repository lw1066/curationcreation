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
import { showUserFeedback } from "../utils/showUserFeedback";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Results>({
    va: [],
    europeana: [],
    info: { record_count: 0, image_count: 0, filterpool_count: 0 },
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
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [europeanaReturnedItemsCount, setEuropeanaReturnedItemsCount] =
    useState<number>(0);
  const [vaReturnedItemsCount, setVaReturnedItemsCount] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setErrorMessage("");
    setVaPage(1);
    setEuropeanaCursor(null);
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0, filterpool_count: 0 },
    });
    setMakerId(null);
    setLoading(true);
    setHasSearched(false);
    setEuropeanaReturnedItemsCount(0);
    setVaReturnedItemsCount(0);
    try {
      if (searchType === "va") {
        const vaResults = await fetchVaSearchResults({
          searchQuery: query,
          searchMakerId: null,
          pageNum: 1,
        });

        const moreVaResults =
          vaResults.vaItemsInfo?.record_count > vaResults.va.length;

        setVaReturnedItemsCount(vaResults.va.length);

        setResults({
          va: vaResults.va,
          europeana: [],
          info: {
            record_count: vaResults.vaItemsInfo?.record_count || 0,
            image_count: vaResults.vaItemsInfo?.image_count || 0,
            filterpool_count: 0,
          },
        });
        setHasMore(moreVaResults);
      }

      // Handle Europeana-only search
      else if (searchType === "europeana") {
        const europeanaResults = await fetchEuropeanaResults(query, null);

        const moreEuropeanaResults = !!europeanaResults.nextCursor;

        setEuropeanaCursor(europeanaResults.nextCursor);
        setEuropeanaReturnedItemsCount(
          (prev) => prev + europeanaResults.europeana.length
        );
        setResults({
          va: [],
          europeana: europeanaResults.europeana,
          info: {
            record_count: europeanaResults.EItemsInfo?.record_count || 0,
            image_count: europeanaResults.EItemsInfo?.image_count || 0,
            filterpool_count: europeanaResults.EItemsInfo.filterpool_count || 0,
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
        setEuropeanaReturnedItemsCount(
          (prev) => prev + europeanaResults.europeana.length
        );
        setVaReturnedItemsCount(vaResults.va.length);
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
            filterpool_count: europeanaResults.EItemsInfo?.filterpool_count,
          },
        });
        setHasMore(moreVaResults || moreEuropeanaResults);
      }
    } catch (error) {
      console.error("Error occurred during search:", error);

      showUserFeedback("Something went wrong. Please try again later.");

      setErrorMessage("Failed to retrieve search results. Please try again.");
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleFullInfoRequest = async (item: ArtItem) => {
    setLoading(true);
    setError(null);
    let fullItem;

    if (item.searchSource === "va") {
      try {
        fullItem = await fetchFullInfo(item.id);
        if (!fullItem) {
          throw new Error("Failed to retrieve full item details.");
        }
      } catch (error) {
        console.error("Error fetching full item details:", error);
        showUserFeedback(
          "Unable to load full details for the selected item. Please try again later."
        );
        setLoading(false);
        return;
      }
    }

    if (item.searchSource === "euro") {
      fullItem = {
        id: item.id,
        searchSource: "euro",
        title: item.title,
        maker: item.maker.name || [],
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

    setFullItem(fullItem);
    setLoading(false);
  };

  const handleMakerSearch = async (makerId: string) => {
    setVaPage(1);
    setEuropeanaCursor(null);
    setSearchType("va");
    setResults({
      va: [],
      europeana: [],
      info: { record_count: 0, image_count: 0, filterpool_count: 0 },
    });
    setLoading(true);
    setError(null);
    setMakerId(makerId);
    setEuropeanaReturnedItemsCount(0);
    setVaReturnedItemsCount(0);

    try {
      const vaResults = await fetchVaSearchResults({
        searchQuery: null,
        searchMakerId: makerId,
        pageNum: 1,
      });

      setVaReturnedItemsCount(vaResults.va.length);

      setResults({
        va: vaResults.va,
        europeana: [],
        info: {
          record_count: vaResults.vaItemsInfo?.record_count || 0,
          image_count: vaResults.vaItemsInfo?.image_count || 0,
          filterpool_count: 0,
        },
      });
    } catch (error) {
      console.error("Error fetching VA search results:", error);
      showUserFeedback(
        "Unable to load results for the selected maker. Please try again later."
      );
      setErrorMessage(
        "Unable to load results for the selected maker. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeFullItemDisplay = () => {
    setFullItem(null);
  };

  const loadMoreResults = async () => {
    if (!hasMore || loading) return;

    setError(null);

    let newVaResults = {
      va: [],
      vaItemsInfo: { record_count: 0, image_count: 0, filterpool_count: 0 },
    };
    let newEuropeanaResults = {
      europeana: [],
      EItemsInfo: { record_count: 0, image_count: 0, filterpool_count: 0 },
      nextCursor: null,
    };

    let moreVaResults = false;
    let moreEuropeanaResults = false;

    try {
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

          const updatedVaReturnedItemsCount =
            vaReturnedItemsCount + newVaResults.va.length;

          setVaReturnedItemsCount(updatedVaReturnedItemsCount);

          moreVaResults =
            newVaResults.vaItemsInfo.record_count > updatedVaReturnedItemsCount;
        } finally {
          setLoading(false);
        }
      }

      // Fetch Euro results if euro or Both are selected
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

          setEuropeanaReturnedItemsCount(
            (prev) => prev + newEuropeanaResults.europeana.length
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
        info: {
          ...prevResults.info,
          filterpool_count:
            prevResults.info.filterpool_count +
            newEuropeanaResults.EItemsInfo.filterpool_count,
        },
      }));

      setHasMore(moreVaResults || moreEuropeanaResults);
    } catch (error) {
      console.error("Error fetching more results:", error);

      showUserFeedback("Unable to load more results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  let filteredVaCount = 0;
  const filteredVaResults = onlyWithImages
    ? results.va.filter((item) => {
        if (!item.baseImageUrl || item.baseImageUrl === "/images/no_image.png")
          filteredVaCount += 1;
        return (
          item.baseImageUrl && item.baseImageUrl !== "/images/no_image.png"
        );
      })
    : results.va;

  const filteredResults = [...filteredVaResults, ...results.europeana];

  //Prepare animated counts
  const animatedRecordCount = useCountAnimation(
    results.info.record_count || 0,
    3000
  );
  const animatedEuroReturn = useCountAnimation(
    europeanaReturnedItemsCount || 0,
    3000
  );
  const animatedFilterpool = useCountAnimation(
    results.info.filterpool_count || 0,
    3000
  );
  const animatedVaReturn = useCountAnimation(
    vaReturnedItemsCount - filteredVaCount || 0,
    3000
  );
  const animatedVapool = useCountAnimation(vaReturnedItemsCount || 0, 3000);

  const handleImageLoad = (id: string) => {
    setImageLoadingStatus((prevState) => ({
      ...prevState,
      [id]: false,
    }));
  };

  const toggleSearchType = (type: "va" | "europeana") => {
    setSearchType((prevType) => {
      if (prevType === type) {
        return prevType;
      } else if (prevType === "both") {
        return type;
      } else {
        return "both";
      }
    });
  };

  return (
    <>
      <div>
        {error && <p>{error}</p>}
        {fullItem && (
          <>
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
              You can search for anything! An artist, a place, an object - see
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
              name="searchTerm"
              required
              style={{
                width: "65%",
                marginBottom: "10px",
                fontSize: "1.25rem",
              }}
            />

            <p style={{ fontSize: ".75rem" }}>Choose collection(s)</p>

            <div style={{ display: "flex", gap: "20px" }}>
              <div
                onClick={() => {
                  toggleSearchType("va");
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
                  toggleSearchType("europeana");
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
                <span className={classes.animatedCounter}>
                  {animatedRecordCount}
                </span>{" "}
                items found
              </p>
              <div className={classes.countsContainer}>
                <p>Showing...</p>
                {searchType != "va" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <Image
                      src="/images/euroLogo.png"
                      alt="Europeana Search"
                      width={35}
                      height={35}
                      style={{
                        paddingTop: "5px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                      }}
                    />

                    <p style={{ width: "250px" }}>
                      <span className={classes.animatedCounter}>
                        {animatedEuroReturn}
                      </span>{" "}
                      items from{" "}
                      <span className={classes.animatedCounter}>
                        {animatedFilterpool}
                      </span>{" "}
                      filtered
                    </p>
                  </div>
                )}
                {searchType != "europeana" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <Image
                        src="/images/Victoria_and_Albert_Museum_Logo.svg"
                        alt="VA Search"
                        width={35}
                        height={35}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "50%",
                        }}
                      />
                      <p style={{ width: "250px" }}>
                        {" "}
                        <span className={classes.animatedCounter}>
                          {animatedVaReturn}
                        </span>{" "}
                        items from{" "}
                        <span className={classes.animatedCounter}>
                          {animatedVapool}
                        </span>{" "}
                        filtered
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="onlyWithImages"
                      checked={onlyWithImages}
                      onChange={(e) => setOnlyWithImages(e.target.checked)}
                    />
                    <label
                      htmlFor="onlyWithImages"
                      style={{ marginLeft: "10px" }}
                    >
                      Only with images
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          {loading && (
            <div className={classes.fetchSpinnerContainer}>
              <div className={classes.spinner}></div>
            </div>
          )}

          {!loading &&
            hasSearched &&
            errorMessage === "" &&
            filteredResults.length === 0 && (
              <div className={classes.noResultsContainer}>
                <p>No results found.</p>
                <p>Check your spelling or search for something else.</p>
              </div>
            )}

          {errorMessage && (
            <div
              className={classes.noResultsContainer}
              style={{ color: "red" }}
            >
              {errorMessage}
            </div>
          )}

          {filteredResults.length > 0 && (
            <div className={classes.resultsGrid}>
              {filteredResults.map((item) => {
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
            <div style={{ marginBottom: "50px" }}>
              <LoadMoreButton onClick={loadMoreResults} disabled={loading} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
