import { useState, MouseEvent, useEffect } from "react";
import Image from "next/image";
import classes from "./fullItemCard.module.css";
import TriangleButton from "./TriangleButton";
import LoadMoreButton from "./LoadMoreButton";
import prepareItemData from "../utils/prepareItemData";
import { Item } from "../types";

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

  // Prepare item data based on the current image index
  const {
    imageUrl,
    title,
    searchSource,
    description,
    physicalDescription,
    materials,
    techniques,
    origins,
    metaImagesCount,
  } = prepareItemData(item, currentImageIndex);

  const handleClickInside = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleNextImage = () => {
    if (currentImageIndex < metaImagesCount - 1) {
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
            src={imageUrl}
            alt={title[0]}
            fill={true}
            style={{ objectFit: "contain" }}
            quality={100}
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={handleImageLoad}
          />
        </div>

        {metaImagesCount > 1 && (
          <div className={classes.imageControls}>
            <LoadMoreButton
              onClick={handlePreviousImage}
              disabled={currentImageIndex === 0 || loading}
              text="Back"
            />
            <p style={{ fontSize: ".5rem", lineHeight: "40px" }}>More images</p>
            <LoadMoreButton
              onClick={handleNextImage}
              disabled={currentImageIndex === metaImagesCount - 1 || loading}
              text="Next"
            />
          </div>
        )}

        <div className={classes.fullItemCard}>
          <h2
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: title[0] }}
          />

          <p>
            <strong>Makers:</strong>{" "}
            {item.maker?.length ? (
              item.maker.map((maker, index) => (
                <span key={index}>
                  {maker.id ? (
                    <span
                      onClick={() => {
                        handleMakerSearch(maker.id!);
                        close();
                      }}
                      className={classes.clickableMaker} // Class applied if maker has an id
                    >
                      {maker.name}
                    </span>
                  ) : (
                    maker.name
                  )}
                  {index < (item.maker?.length ?? 0) - 1 ? ", " : ""}{" "}
                </span>
              ))
            ) : (
              <span>Not available</span>
            )}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </p>
          <p>
            <strong>Physical Description:</strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: physicalDescription }} />
          </p>
          <div>
            <strong>Materials:</strong>{" "}
            {materials.length > 0 ? (
              materials.map((material, index) => (
                <span key={index}>
                  {material}
                  {index < materials.length - 1 ? ", " : ""}
                </span>
              ))
            ) : (
              <span>Not listed</span>
            )}
          </div>
          <div>
            <strong>Techniques:</strong>{" "}
            {techniques.length > 0 ? (
              techniques.map((technique, index) => (
                <span key={index}>
                  {technique}
                  {index < techniques.length - 1 ? ", " : ""}
                </span>
              ))
            ) : (
              <span>Not listed</span>
            )}
          </div>
          <div>
            <strong>Origins:</strong>{" "}
            {origins.length > 0 ? (
              origins.map((origin, index) => (
                <span key={index}>
                  {origin}
                  {index < origins.length - 1 ? ", " : ""}
                </span>
              ))
            ) : (
              <span>Not listed</span>
            )}
          </div>
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
