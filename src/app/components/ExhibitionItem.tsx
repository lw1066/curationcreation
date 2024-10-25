import { useEffect, useState } from "react";
import { useExhibition } from "../contexts/ExhibitionContext";
import Image from "next/image";
import classes from "./exhibitionItem.module.css";
import LoadMoreButton from "./LoadMoreButton";
import { Item } from "../types";
import { checkSourceLink } from "../utils/checkSourceLink";
import { showUserFeedback } from "../utils/showUserFeedback";

const ExhibitionItem = ({ item }: { item: Item }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isLinkValid, setIsLinkValid] = useState<boolean | null>(null);

  const { removeItem } = useExhibition();

  const {
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

  const handleInfoClick = () => {
    setShowInfo((prev) => !prev);
  };

  const handleRemoveItem = (itemID: string) => {
    removeItem(itemID);
    showUserFeedback("item removed from exhibition");
  };

  const currentImageUrl =
    imageUrls?.[currentImageIndex] || "/images/no_image.png";

  return (
    <div className={classes.itemCard} key={item.id}>
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
          sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className={classes.imageButtonsContainer}>
        {imagesCount > 1 && (
          <LoadMoreButton
            onClick={handlePreviousImage}
            disabled={currentImageIndex === 0}
            text="Back"
          />
        )}

        <button className={classes.infoButton} onClick={handleInfoClick}>
          {showInfo ? "Close" : "Info"}
        </button>

        {imagesCount > 1 && (
          <LoadMoreButton
            onClick={handleNextImage}
            disabled={currentImageIndex === imagesCount - 1}
            text="Next"
          />
        )}
      </div>
      <div
        className={`${classes.infoContainer} ${showInfo ? classes.active : ""}`}
      >
        <div className={classes.itemInfo}>
          <h2
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {maker && maker.length > 0 && maker[0].name != "Not provided" && (
            <p>
              <strong>Makers:</strong>{" "}
              {item.maker?.map((maker, index) => (
                <span key={index}>
                  {maker.name}
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
            <div style={{ fontSize: "14px" }}>
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
            <div style={{ fontSize: "14px" }}>
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
            <div style={{ fontSize: "14px" }}>
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

          <button
            className={classes.removeButton}
            onClick={() => handleRemoveItem(item.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionItem;
