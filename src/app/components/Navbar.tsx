import React from "react";
import Image from "next/image";
import styles from "./Navbar.module.css";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoImage}>
          <Image
            className={styles.logo}
            src="/images/logo.png"
            alt="Curator-Creator logo"
            width={100}
            height={100}
            priority
          />
        </div>

        <div className={styles.logoText}>
          <h1 className={styles.largeC}>C</h1>
          <div className={styles.textStack}>
            <div className={styles.first}>uration</div>
            <div className={styles.second}>reation</div>
          </div>
        </div>
      </div>
      <div className={styles.navLinks}>
        <Link href="/">Home</Link>
        <Link href="/ArtSearch">Art Search</Link>
        <Link href="/Exhibition">Exhibition</Link>
      </div>
    </nav>
  );
};

export default Navbar;
