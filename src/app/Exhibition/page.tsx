"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useExhibition } from "../contexts/ExhibitionContext"; // Import the exhibition context
import classes from "./exhibition.module.css";
import ExhibitionItem from "../components/ExhibitionItem";
import ImageCarousel from "../components/ImageCarousel";
import LoadMoreButton from "../components/LoadMoreButton";
import Link from "next/link";

const ExhibitionPage = () => {
  const [showCarousel, setShowCarousel] = useState<boolean>(false);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  const { user } = useAuth();
  const { exhibitionItems } = useExhibition();

  const handleShowCarousel = () => {
    const images = exhibitionItems.flatMap(
      (item) =>
        item.imageUrls?.filter(
          (url): url is string => typeof url === "string"
        ) || []
    );
    setCarouselImages(images);
    setShowCarousel(true);
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
        {user ? (
          <>
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
                  <ExhibitionItem key={item.id} item={item} />
                ))
              ) : (
                <p>No items in the exhibition yet.</p>
              )}
            </div>
          </>
        ) : (
          <Link href="/Login">
            <LoadMoreButton
              text="Login / signup to view your exhibition"
              fontSize="10px"
              height="120px"
              width="120px"
              onClick={() => {}}
            />
          </Link>
        )}
      </div>
    </>
  );
};

export default ExhibitionPage;
