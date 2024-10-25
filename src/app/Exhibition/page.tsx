"use client";

import { useState, useEffect } from "react";
import classes from "./exhibition.module.css";
import ExhibitionItem from "../components/ExhibitionItem";
import { Item } from "../types";
import ImageCarousel from "../components/ImageCarousel";
import LoadMoreButton from "../components/LoadMoreButton";
import { showUserFeedback } from "../utils/showUserFeedback";

const ExhibitionPage = () => {
  const [exhibitionItems, setExhibitionItems] = useState<Item[]>([]);
  const [showCarousel, setShowCarousel] = useState<boolean>(false);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem("exhibitionItems");
      if (storedItems) {
        setExhibitionItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error(
        "Error retrieving exhibition items from localStorage:",
        error
      );
      showUserFeedback(
        "There was a problem retrieving your items from local storage - try again later"
      );
      setExhibitionItems([]);
    }
  }, []);

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = exhibitionItems.filter((item) => item.id !== itemId);
    localStorage.setItem("exhibitionItems", JSON.stringify(updatedItems));
    setExhibitionItems(updatedItems);
  };

  const handleShowCarousel = () => {
    const carouselImages = exhibitionItems.flatMap((item) => {
      return (
        item.imageUrls?.filter(
          (url): url is string => typeof url === "string"
        ) || []
      );
    });
    setCarouselImages(carouselImages);
    setShowCarousel(true);
    console.log(exhibitionItems);
  };

  const handleCloseCarousel = () => {
    setShowCarousel(false);
  };

  return (
    <>
      {showCarousel && (
        <ImageCarousel
          carouselImages={carouselImages}
          handleCloseCarousel={handleCloseCarousel}
        />
      )}
      <div className={classes.exhibitionPage}>
        <h1 className={classes.greeting}>
          {exhibitionItems.length} item
          {exhibitionItems.length !== 1 ? "s" : ""} in exhibition
        </h1>

        <div className={classes.exhibitionInstructions}>
          <p>Scroll down to look at your items and info.</p>
          <p> Take a look at just the images by clicking below...</p>
          <LoadMoreButton
            text="Images only!"
            width="55px"
            height="55px"
            onClick={handleShowCarousel}
          />

          <h2 className={classes.greeting} style={{ marginTop: "30px" }}>
            Your Exhibition!
          </h2>
        </div>

        <div className={classes.exhibitionGrid}>
          {exhibitionItems.length > 0 ? (
            exhibitionItems.map((item) => (
              <ExhibitionItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
              />
            ))
          ) : (
            <p>No items in the exhibition yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ExhibitionPage;
