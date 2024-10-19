import axios from "axios";
import { ArtItem } from "../types";

export const fetchFullInfo = async (item: ArtItem) => {
  if (item.searchSource === "va") {
    const id = item.id;
    try {
      const response = await axios.post("/api/va-full-info", { id });
      return response.data.data.vaFullItem;
    } catch (err) {
      throw new Error(`An error occurred: ${err}`);
    }
  } else if (item.searchSource === "euro") {
    return {
      id: item.id,
      searchSource: "euro",
      title: item.title,
      maker: [{ name: "Europeana does not provide maker" }],
      date: item.date || "unknown",
      baseImageUrl: item.baseImageUrl || "/No_Image_Available.jpg",
      backupImageUrl: item.baseImageUrl,
      description: `Item provided by ${item.dataProvider}. ${item.description}`,
      physicalDescription: "Not provided",
      materials: [],
      techniques: [],
      placesOfOrigin: [],
      productionDates: [],
      images: {
        _iiif_image: item.fullImage || "/images/no_image.png",
      },
      briefDescription: "Not provided by Europenana",
    };
  }
};
