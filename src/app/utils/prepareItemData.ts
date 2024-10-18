import DOMPurify from "dompurify";
import { Item } from "../types";

const sanitizeHTML = (htmlString: string): string => {
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS: ["i", "em", "b", "strong", "br", "p"],
  });
};

const prepareItemData = (item: Item) => {
  let imageUrls;
  let baseImageUrl;

  if (item.searchSource === "va") {
    baseImageUrl =
      item.images?._iiif_image &&
      item.images?._iiif_image != "/images/no_image.png"
        ? `${item.images?._iiif_image}/full/full/0/default.jpg`
        : "/images/no_image.png";

    imageUrls = item.images?.imagesMeta?.map((image) => {
      return `https://framemark.vam.ac.uk/collections/${image.assetRef}/full/full/0/default.jpg`;
    });
  } else {
    imageUrls = [item.baseImageUrl];
    baseImageUrl = item.baseImageUrl;
  }

  return {
    searchSource: item.searchSource,
    imageUrls: imageUrls,
    title: [sanitizeHTML(item?.title || "Untitled")],
    makerName: Array.isArray(item.maker)
      ? item.maker[0]?.name || "Not provided"
      : typeof item.maker === "string"
      ? item.maker
      : "Not provided",
    baseImageUrl: baseImageUrl || "/images/no_image.png",
    description: sanitizeHTML(item?.description || "No description available"),
    physicalDescription: sanitizeHTML(
      item?.physicalDescription || "No physical description available"
    ),
    materials: item?.materials?.map((material) => material.text) || [],
    techniques: item?.techniques?.map((technique) => technique.text) || [],
    origins: item?.origins?.map((origin) => origin.place.text) || [],
    imagesCount: imageUrls ? imageUrls.length : 0,
  };
};

export default prepareItemData;
