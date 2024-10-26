"use client";

import Image from "next/image";
import classes from "./page.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadMoreButton from "./components/LoadMoreButton";

export default function Home() {
  const imageCount = 9;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageCount);
    }, 7000);

    return () => clearInterval(interval);
  }, [imageCount]);

  return (
    <>
      <div className={classes.carouselContainer}>
        <Image
          src={`/images/gallery${currentImageIndex + 1}.jpg`}
          alt={`Gallery Image ${currentImageIndex + 1}`}
          className={classes.carouselImage}
          fill={true}
          quality={50}
          sizes="100vw"
        />
      </div>
      <div className={classes.welcomePage}>
        <h2 style={{ textAlign: "center" }}>Make an exhibition for yourself</h2>
        <p>
          Curation Creation allows you to explore online catalogues, find
          interesting objects and add them to your own exhibition. You can
          explore millions of items created over thousands of years to curate
          your perfect collection.
        </p>
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link href="/Login">
            <LoadMoreButton
              text="Login / signup"
              fontSize="11px"
              height="60px"
              width="60px"
              onClick={() => {}}
            />
          </Link>
          <p>
            Just signup (free and simple) to create, save and view your
            exhibition whenever you want.
          </p>
        </div>
        <p>
          Thank you to the two online catalogues that power this site. Below are
          words from each explaining their missions - click on the logos to
          explore their sites.{" "}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            width: "100%",
            marginTop: "15px",
          }}
        >
          <Link href="https://www.vam.ac.uk/">
            <Image
              src="/images/Victoria_and_Albert_Museum_Logo.svg"
              alt="VA Search"
              width={45}
              height={45}
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            />
          </Link>
          <p style={{ fontWeight: "600" }}>The Victoria and Albert Museum</p>
        </div>
        <p style={{ fontStyle: "italic", width: "80%" }}>
          &quot;We share a 5,000 year old story of creativity through
          exhibitions, events, educational programmes, digital experiences,
          conservation, research and an ever-evolving national collection of
          over 2.8 million objects spanning every creative discipline.&quot;
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            width: "100%",
            marginTop: "15px",
          }}
        >
          <Link href="https://www.europeana.eu/en">
            <Image
              src="/images/euroLogo.png"
              alt="Europeana Search"
              width={45}
              height={45}
              style={{
                paddingTop: "5px",
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            />
          </Link>
          <p style={{ fontWeight: "600" }}>Europeana</p>
        </div>
        <p style={{ fontStyle: "italic", width: "80%" }}>
          &quot;We display digital cultural heritage from over 2000 different
          European providing institutions... Why? To inspire and inform fresh
          perspectives and open conversations about our history and culture.
          Discover artworks, books, music, and videos on art, newspapers,
          archaeology, fashion, science, sport, and much more.&quot;
        </p>
      </div>
    </>
  );
}
