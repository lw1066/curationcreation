import { useState, useEffect } from "react";
import Image from "next/image";
import classes from "./imageCarousel.module.css";
import TriangleButton from "./TriangleButton";

type ImageCarouselProps = {
  carouselImages: string[];
  handleCloseCarousel: () => void;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  carouselImages,
  handleCloseCarousel,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Detect touchscreen device
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    // Disable scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    // Reset scroll
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Swipe handling
  useEffect(() => {
    if (isTouchDevice) {
      let touchStartX: number = 0;
      let touchEndX: number = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.changedTouches[0].screenX;
      };

      const handleTouchMove = (e: TouchEvent) => {
        touchEndX = e.changedTouches[0].screenX;
      };

      const handleTouchEnd = () => {
        if (touchStartX - touchEndX > 50) {
          handleNext(); // Swipe left to go to the next image
        }

        if (touchStartX - touchEndX < -50) {
          handlePrev(); // Swipe right to go to the previous image
        }
      };

      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isTouchDevice]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const imagesSeen = currentIndex;
  const imagesRemaining = carouselImages.length - currentIndex - 1;

  return (
    <div className={classes.carouselContainer}>
      <div className={classes.carouselImageWrapper}>
        <Image
          src={carouselImages[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          fill
          sizes="100vw"
          quality={100}
          style={{ objectFit: "contain" }}
        />
      </div>

      <>
        <button
          className={`${classes.prevButton} ${classes.imageButton}`}
          onClick={handlePrev}
        >
          &#10094;{" "}
          <span className={classes.imageCount}>
            {imagesSeen > 0 ? `${imagesSeen}` : ""}
          </span>
        </button>
        <button
          className={`${classes.nextButton} ${classes.imageButton}`}
          onClick={handleNext}
        >
          <span className={classes.imageCount}>
            {imagesRemaining > 0 ? `${imagesRemaining}` : ""}
          </span>
          &#10095;
        </button>
      </>

      <TriangleButton text="Close" onClick={handleCloseCarousel} />
    </div>
  );
};

export default ImageCarousel;
