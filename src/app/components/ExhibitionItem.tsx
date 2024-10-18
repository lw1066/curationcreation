import { useState } from "react";
import Image from "next/image";
import classes from "./exhibitionItem.module.css";
import LoadMoreButton from "./LoadMoreButton";
import prepareItemData from "../utils/prepareItemData";
import { Item } from "../types";

interface ExhibitionItemProps {
  item: Item;
  onRemove: (id: string) => void;
}

const ExhibitionItem = ({ item, onRemove }: ExhibitionItemProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const {
    imageUrls,
    title,
    searchSource,
    description,
    physicalDescription,
    materials,
    techniques,
    origins,
    imagesCount,
    makerName,
  } = prepareItemData(item);

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
          alt={title.join("")}
          fill={true}
          style={{ objectFit: "contain" }}
          quality={100}
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className={classes.imageButtonsContainer}>
        <button className={classes.infoButton} onClick={handleInfoClick}>
          {showInfo ? "Close" : "Info"}
        </button>

        {imagesCount > 1 && (
          <>
            <LoadMoreButton
              onClick={handlePreviousImage}
              disabled={currentImageIndex === 0}
              text="Back"
            />
            <LoadMoreButton
              onClick={handleNextImage}
              disabled={currentImageIndex === imagesCount - 1}
              text="Next"
            />
          </>
        )}
      </div>
      <div
        className={`${classes.infoContainer} ${showInfo ? classes.active : ""}`}
      >
        <div className={classes.itemInfo}>
          <h2
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: title[0] }}
          />
          {searchSource === "va" && (
            <p>
              <strong>Maker:</strong> {makerName}
            </p>
          )}
          <p>
            <strong>Description:</strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </p>
          {searchSource === "va" && (
            <>
              <p>
                <strong>Physical Description:</strong>{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: physicalDescription }}
                />
              </p>
              <p>
                <strong>Materials:</strong>{" "}
                {materials.length > 0 ? materials.join(", ") : "Not listed"}
              </p>
              <p>
                <strong>Techniques:</strong>{" "}
                {techniques.length > 0 ? techniques.join(", ") : "Not listed"}
              </p>
            </>
          )}
          <p>
            <strong>Origins:</strong>{" "}
            {origins.length > 0 ? origins.join(", ") : "Not listed"}
          </p>
          <button
            className={classes.removeButton}
            onClick={() => onRemove(item.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionItem;
