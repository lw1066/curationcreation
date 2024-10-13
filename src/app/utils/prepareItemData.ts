import DOMPurify from "dompurify";
import { Item } from "../types";

const sanitizeHTML = (htmlString: string): string => {
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS: ["i", "em", "b", "strong", "br", "p"],
  });
};

const prepareItemData = (item: Item, currentImageIndex: number) => {
  let imageUrl;

  if (item.searchSource === "va") {
    imageUrl = item.images?._iiif_image
      ? `${item.images._iiif_image}/full/full/0/default.jpg`
      : "/images/no_image.png";
  } else {
    imageUrl = item.baseImageUrl;
  }

  const metaImages = item.images?.imagesMeta;
  const currentImageUrl =
    metaImages && metaImages[currentImageIndex]
      ? `https://framemark.vam.ac.uk/collections/${metaImages[currentImageIndex].assetRef}/full/full/0/default.jpg`
      : imageUrl;

  return {
    searchSource: item.searchSource,
    imageUrl: currentImageUrl,
    title: [sanitizeHTML(item?.title || "Untitled")],
    makerName: item.maker?.[0].name || "Not provided",
    baseImageUrl: item.baseImageUrl || "/No_Image_Available.jpg",
    description: sanitizeHTML(item?.description || "No description available"),
    physicalDescription: sanitizeHTML(
      item?.physicalDescription || "No physical description available"
    ),
    materials: item?.materials?.map((material) => material.text) || [],
    techniques: item?.techniques?.map((technique) => technique.text) || [],
    origins: item?.origins?.map((origin) => origin.place.text) || [],
    metaImagesCount: metaImages ? metaImages.length : 0,
  };
};

export default prepareItemData;
