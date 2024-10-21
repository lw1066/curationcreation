import { useState, MouseEvent, useEffect, SyntheticEvent } from "react";
import Image from "next/image";
import classes from "./fullItemCard.module.css";
import TriangleButton from "./TriangleButton";
import LoadMoreButton from "./LoadMoreButton";
import { Item } from "../types";
import { checkSourceLink } from "../utils/checkSourceLink";

// Define prop types for VaItemDisplay component
interface FullItemCardProps {
  item: Item;
  close: () => void;
  handleMakerSearch: (makerId: string) => void;
}

const FullItemCard = ({
  item,
  close,
  handleMakerSearch,
}: FullItemCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInExhibition, setIsInExhibition] = useState<boolean>(false);
  const [isLinkValid, setIsLinkValid] = useState<boolean | null>(null);

  const {
    baseImageUrl,
    imageUrls,
    title,
    description,
    physicalDescription,
    materials,
    techniques,
    placesOfOrigin,
    imagesCount,
    subject,
    maker,
    productionDates,
    date,
    provider,
    country,
    sourceLink,
  } = item;

  useEffect(() => {
    const validateLink = async () => {
      if (item.sourceLink) {
        const isValid = await checkSourceLink(item.sourceLink);
        setIsLinkValid(isValid);
      } else {
        setIsLinkValid(false);
      }
    };

    validateLink();
  }, [item.sourceLink]);

  const handleClickInside = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleNextImage = () => {
    if (currentImageIndex < imagesCount - 1) {
      setLoading(true);
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setLoading(true);
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = baseImageUrl;
  };

  const addItemToExhibition = () => {
    const existingItems = localStorage.getItem("exhibitionItems");
    const exhibitionItems: Item[] = existingItems
      ? JSON.parse(existingItems)
      : [];

    const isItemAlreadyAdded = exhibitionItems.some(
      (exhibitItem) => exhibitItem.id === item.id
    );

    if (!isItemAlreadyAdded) {
      exhibitionItems.push(item);
      localStorage.setItem("exhibitionItems", JSON.stringify(exhibitionItems));
      setIsInExhibition(true);
      alert("Item added to exhibition!");
    }
  };

  const removeItemFromExhibition = () => {
    const existingItems = localStorage.getItem("exhibitionItems");
    let exhibitionItems: Item[] = existingItems
      ? JSON.parse(existingItems)
      : [];

    exhibitionItems = exhibitionItems.filter(
      (exhibitItem) => exhibitItem.id !== item.id
    );

    localStorage.setItem("exhibitionItems", JSON.stringify(exhibitionItems));
    setIsInExhibition(false);
    alert("Item removed from exhibition.");
  };

  useEffect(() => {
    const existingItems = localStorage.getItem("exhibitionItems");
    const exhibitionItems: Item[] = existingItems
      ? JSON.parse(existingItems)
      : [];

    const isItemInExhibition = exhibitionItems.some(
      (exhibitItem) => exhibitItem.id === item.id
    );

    setIsInExhibition(isItemInExhibition);
  }, [item]);

  const currentImageUrl =
    imageUrls?.[currentImageIndex] || "/images/no_image.png";

  return (
    <div className={classes.overlay} onClick={close}>
      <div className={classes.centeredContainer} onClick={handleClickInside}>
        <div className={classes.imageContainer}>
          {loading && (
            <div className={classes.spinnerContainer}>
              <div className={classes.spinner}></div>
            </div>
          )}
          <Image
            src={currentImageUrl}
            alt={title}
            fill={true}
            style={{ objectFit: "contain" }}
            quality={100}
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>

        {imagesCount && imagesCount > 1 && (
          <div className={classes.imageControls}>
            <LoadMoreButton
              onClick={handlePreviousImage}
              disabled={currentImageIndex === 0 || loading}
              text="Back"
            />
            <p style={{ fontSize: ".5rem", lineHeight: "40px" }}>More images</p>
            <LoadMoreButton
              onClick={handleNextImage}
              disabled={currentImageIndex === imagesCount - 1 || loading}
              text="Next"
            />
          </div>
        )}

        <div className={classes.fullItemCard}>
          <h2
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {maker && maker.length > 0 && maker[0].name != "Not provided" && (
            <p>
              <strong>Makers:</strong>{" "}
              {item.maker?.map((maker, index) => (
                <span key={index}>
                  {maker.id ? (
                    <span
                      onClick={() => {
                        handleMakerSearch(maker.id!);
                        close();
                      }}
                      className={classes.clickableMaker}
                    >
                      {maker.name}
                    </span>
                  ) : (
                    maker.name
                  )}
                  {index < (item.maker?.length ?? 0) - 1 ? " | " : ""}
                </span>
              ))}
            </p>
          )}

          {productionDates &&
            productionDates.length > 0 &&
            productionDates[0].date?.text && (
              <p>
                <strong>Date:</strong> {productionDates[0].date?.text}
              </p>
            )}

          {date && date != "Not provided" && (
            <p>
              <strong>Date:</strong> {date}
            </p>
          )}

          {subject && subject != "Not provided" && <p>{subject}</p>}

          {description && description != "Not provided" && (
            <p>
              <strong>Description:</strong>{" "}
              <span dangerouslySetInnerHTML={{ __html: description }} />
            </p>
          )}

          {physicalDescription && physicalDescription != "Not provided" && (
            <p>
              <strong>Physical Description:</strong>{" "}
              <span dangerouslySetInnerHTML={{ __html: physicalDescription }} />
            </p>
          )}

          {materials && materials.length > 0 && (
            <div>
              <strong>Materials:</strong>{" "}
              {materials.map((material, index) => (
                <span key={index}>
                  {material.text}
                  {index < materials.length - 1 ? " | " : ""}
                </span>
              ))}
            </div>
          )}

          {techniques && techniques.length > 0 && (
            <div>
              <strong>Techniques:</strong>{" "}
              {techniques.map((technique, index) => (
                <span key={index}>
                  {technique.text}
                  {index < techniques.length - 1 ? " | " : ""}
                </span>
              ))}
            </div>
          )}

          {placesOfOrigin && placesOfOrigin.length > 0 && (
            <div>
              <strong>Origins:</strong>{" "}
              {placesOfOrigin.map((origin, index) => (
                <span key={index}>
                  {origin.place.text}
                  {index < placesOfOrigin.length - 1 ? " | " : ""}
                </span>
              ))}
            </div>
          )}

          {country && country != "Not provided" && (
            <p>
              <strong>Item location:</strong> {country}
            </p>
          )}

          {provider && provider != "Not provided" && (
            <p>
              <strong>Data provided by:</strong> {provider}
            </p>
          )}

          {sourceLink && (
            <>
              <p>
                <strong>Info link:</strong>{" "}
                {isLinkValid === null ? (
                  "checking link..."
                ) : isLinkValid ? (
                  <a
                    href={sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      maxWidth: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      verticalAlign: "bottom",
                    }}
                    title={sourceLink}
                  >
                    {sourceLink}
                  </a>
                ) : (
                  "None"
                )}
              </p>
              <p>(Click for external item link)</p>
            </>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "20px",
            }}
          >
            {isInExhibition ? (
              <button
                className={classes.exhibitionButton}
                onClick={removeItemFromExhibition}
              >
                Remove from Exhibition
              </button>
            ) : (
              <button
                className={classes.exhibitionButton}
                onClick={addItemToExhibition}
                style={{ color: "white", borderColor: "white" }}
              >
                Add to Exhibition
              </button>
            )}
          </div>
        </div>
        <TriangleButton onClick={close} text="Close" />
      </div>
    </div>
  );
};

export default FullItemCard;
