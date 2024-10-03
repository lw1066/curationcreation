import { useState } from "react";
import Image from "next/image";
import classes from "./exhibitionItem.module.css";
import LoadMoreButton from "./LoadMoreButton";

interface Maker {
  name: string;
  id?: string;
}

interface Material {
  text: string;
}

interface Technique {
  text: string;
}

interface Origin {
  place: {
    text: string;
  };
}

interface ImageMeta {
  assetRef: string;
}

interface Item {
  id: string;
  maker?: Maker[];
  title?: string;
  description?: string;
  physicalDescription?: string;
  materials?: Material[];
  techniques?: Technique[];
  origins?: Origin[];
  images?: {
    _iiif_image: string;
    imagesMeta?: ImageMeta[];
  };
  provider?: string;
}

interface ExhibitionItemProps {
  item: Item;
  onRemove: (id: string) => void;
}

const prepareItemData = (item: Item, currentImageIndex: number) => {
  const imageUrl = item.images?._iiif_image
    ? `${item.images._iiif_image}/full/full/0/default.jpg`
    : "/images/no_image.png";

  const metaImages = item.images?.imagesMeta;
  const currentImageUrl =
    metaImages && metaImages[currentImageIndex]
      ? `https://framemark.vam.ac.uk/collections/${metaImages[currentImageIndex].assetRef}/full/full/0/default.jpg`
      : imageUrl;

  return {
    imageUrl: currentImageUrl,
    title: item?.title || "Untitled",
    makerName: item?.maker?.[0]?.name || "Not available",
    makerId: item?.maker?.[0]?.id || "",
    description: item?.description || "No description available",
    physicalDescription:
      item?.physicalDescription || "No physical description available",
    materials: item?.materials?.map((material) => material.text) || [],
    techniques: item?.techniques?.map((technique) => technique.text) || [],
    origins: item?.origins?.map((origin) => origin.place.text) || [],
    metaImagesCount: item.images?.imagesMeta?.length || 0, // Number of images
  };
};

const ExhibitionItem = ({ item, onRemove }: ExhibitionItemProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const {
    imageUrl,
    title,
    makerName,
    description,
    physicalDescription,
    materials,
    techniques,
    origins,
    metaImagesCount,
  } = prepareItemData(item, currentImageIndex);

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

  const handleInfoClick = () => {
    setShowInfo((prev) => !prev);
  };

  return (
    <div className={classes.itemCard} key={item.id}>
      <div className={classes.imageContainer}>
        {loading && (
          <div className={classes.spinnerContainer}>
            <div className={classes.spinner}></div>
          </div>
        )}

        <Image
          src={imageUrl}
          alt={title}
          fill={true}
          style={{ objectFit: "contain" }}
          quality={100}
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className={classes.imageButtonsContainer}>
        <button className={classes.infoButton} onClick={handleInfoClick}>
          Info
        </button>

        {metaImagesCount > 1 && (
          <>
            <LoadMoreButton
              onClick={handlePreviousImage}
              disabled={currentImageIndex === 0}
              text="Back"
            />
            <LoadMoreButton
              onClick={handleNextImage}
              disabled={currentImageIndex === metaImagesCount - 1}
              text="Next"
            />
          </>
        )}
      </div>
      <div
        className={`${classes.infoContainer} ${showInfo ? classes.active : ""}`}
      >
        <div className={classes.itemInfo}>
          <h2 className={classes.title}>{title}</h2>
          <p>
            <strong>Maker:</strong> {makerName}
          </p>
          <p>
            <strong>Description:</strong> {description}
          </p>
          <p>
            <strong>Physical Description:</strong> {physicalDescription}
          </p>
          <p>
            <strong>Materials:</strong>{" "}
            {materials.length > 0 ? materials.join(", ") : "Not listed"}
          </p>
          <p>
            <strong>Techniques:</strong>{" "}
            {techniques.length > 0 ? techniques.join(", ") : "Not listed"}
          </p>
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
