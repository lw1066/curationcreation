import { useState, MouseEvent } from "react";
import Image from "next/image";
import DOMPurify from "dompurify";
import classes from "./fullItemCard.module.css";
import TriangleButton from "./TriangleButton";

// Define types for item data structures
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

// Define prop types for VaItemDisplay component
interface VaItemDisplayProps {
  item: Item;
  close: () => void;
  handleMakerSearch: (makerId: string) => void;
}

// Function to sanitize HTML content
const sanitizeHTML = (htmlString: string): string => {
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS: ["i", "em", "b", "strong", "br", "p"],
  });
};

// Function to prepare and clean the item data
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
    title: [sanitizeHTML(item?.title || "Untitled")],
    makerName: item?.maker?.[0]?.name || "Not available",
    makerId: item?.maker?.[0]?.id || "",
    description: sanitizeHTML(item?.description || "No description available"),
    physicalDescription: sanitizeHTML(
      item?.physicalDescription || "No physical description available"
    ),
    materials: item?.materials?.map((material) => material.text) || [],
    techniques: item?.techniques?.map((technique) => technique.text) || [],
    origins: item?.origins?.map((origin) => origin.place.text) || [],
    metaImagesCount: item.images?.imagesMeta?.length
      ? item.images?.imagesMeta?.length
      : 0, // Get number of images
  };
};

const VaItemDisplay = ({
  item,
  close,
  handleMakerSearch,
}: VaItemDisplayProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Prepare item data based on the current image index
  const {
    imageUrl,
    title,
    makerName,
    makerId,
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

  return (
    <div className={classes.overlay} onClick={close}>
      <div className={classes.centeredContainer} onClick={handleClickInside}>
        <div className={classes.imageContainer}>
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
            <button
              className={classes.navButton}
              onClick={handlePreviousImage}
              disabled={currentImageIndex === 0 || loading}
            >
              Back
            </button>
            <p style={{ fontSize: ".5rem", lineHeight: "30px" }}>More images</p>
            <button
              className={classes.navButton}
              onClick={handleNextImage}
              disabled={currentImageIndex === metaImagesCount - 1 || loading}
            >
              Next
            </button>
          </div>
        )}

        <div className={classes.fullItemCard}>
          <h2
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: title[0] }}
          ></h2>
          <p>
            <strong>Maker:</strong>{" "}
            {makerId ? (
              <span
                onClick={() => {
                  handleMakerSearch(makerId);
                  close();
                }}
                className={classes.clickableMaker}
              >
                {makerName}
              </span>
            ) : (
              makerName
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
        </div>
        <TriangleButton onClick={close} text="Close" />
      </div>
    </div>
  );
};

export default VaItemDisplay;
