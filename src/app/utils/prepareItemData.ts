// import sanitizeHtml from "sanitize-html";

// import { Item } from "../types";

// const sanitizeHTML = (htmlString: string): string => {
//   return sanitizeHtml(htmlString, {
//     allowedTags: ["i", "em", "b", "strong", "br", "p"],
//     allowedAttributes: {}, // Add allowed attributes if needed
//   });
// };

// const prepareItemData = (item: Item) => {
//   let imageUrls;
//   let baseImageUrl;

//   console.log(item);

//   if (item.searchSource === "va") {
//   } else {
//     imageUrls = [item.baseImageUrl];
//     baseImageUrl = item.baseImageUrl;
//   }

//   return {
//     searchSource: item.searchSource,
//     imageUrls: imageUrls,
//     title: [sanitizeHTML(item?.title || "Untitled")],
//     makerName: Array.isArray(item.maker)
//       ? item.maker[0]?.name || "Not provided"
//       : typeof item.maker === "string"
//       ? item.maker
//       : "Not provided",
//     baseImageUrl: baseImageUrl || "/images/no_image.png",
//     description: sanitizeHTML(item?.description || "Not provided"),
//     physicalDescription: sanitizeHTML(
//       item?.physicalDescription || "Not provided"
//     ),
//     materials: item?.materials?.map((material) => material.text) || [],
//     techniques: item?.techniques?.map((technique) => technique.text) || [],
//     placesOfOrigin: item?.placesOfOrigin,
//     imagesCount: imageUrls ? imageUrls.length : 0,
//   };
// };

// export default prepareItemData;
