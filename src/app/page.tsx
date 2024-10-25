import Image from "next/image";
import classes from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={classes.welcomePage}>
      <main className={classes.main}>
        <h1 style={{ textAlign: "center" }}>See the world your way</h1>
        <p>
          Curation Creation allows you to explore online catalogues, find great
          items and add them to your exhibition.{" "}
        </p>
        <p>Explore two huge online catalogues: </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="https://www.vam.ac.uk/">
            <Image
              src="/images/Victoria_and_Albert_Museum_Logo.svg"
              alt="VA Search"
              width={35}
              height={35}
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            />
          </Link>
          <p>The Victoria and Albert Museum</p>
        </div>
        <p> Over 1m items spanning 5000 years!</p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="https://www.europeana.eu/en">
            <Image
              src="/images/euroLogo.png"
              alt="Europeana Search"
              width={35}
              height={35}
              style={{
                paddingTop: "5px",
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            />
          </Link>
          <p>Europeana</p>
        </div>
        <p> Over 32m images from 2000 European cultural institutions!</p>
      </main>
    </div>
  );
}
