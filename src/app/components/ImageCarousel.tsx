import { useState, useEffect, useRef } from "react";
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
  const touchStartXRef = useRef<number | null>(null);

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
      const handleTouchStart = (e: TouchEvent) => {
        touchStartXRef.current = e.changedTouches[0].screenX;
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (touchStartXRef.current === null) return;

        const touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchStartXRef.current - touchEndX;

        // Check for a significant swipe
        if (swipeDistance > 50) handleNext();
        else if (swipeDistance < -50) handlePrev();

        // Reset touchStartX for the next touch
        touchStartXRef.current = null;
      };

      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isTouchDevice, handleNext, handlePrev]);

  const imagesSeen = currentIndex;
  const imagesRemaining = carouselImages.length - currentIndex - 1;

  return (
    <div className={classes.carouselContainer}>
      <div className={classes.swipeIndicator}>
        <p>
          &#10094; {imagesSeen + 1} of {carouselImages.length} &#10095;
        </p>
      </div>
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
