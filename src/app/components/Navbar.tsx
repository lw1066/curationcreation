"use client";

import React from "react";
import Image from "next/image";
import classes from "./Navbar.module.css"; // Changed styles to classes
import { usePathname } from "next/navigation";
import Link from "next/link";

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={classes.navbar}>
      <div className={classes.logoContainer}>
        <div className={classes.logoImage}>
          <Image
            className={classes.logo}
            src="/images/logo.png"
            alt="Curator-Creator logo"
            width={100}
            height={100}
            priority
          />
        </div>

        <div className={classes.logoText}>
          <h1 className={classes.largeC}>C</h1>
          <div className={classes.textStack}>
            <div className={classes.first}>uration</div>
            <div className={classes.second}>reation</div>
          </div>
        </div>
      </div>
      <div className={classes.navLinks}>
        <Link href="/" className={isActive("/") ? classes.activeLink : ""}>
          Home
        </Link>
        <Link
          href="/ArtSearch"
          className={isActive("/ArtSearch") ? classes.activeLink : ""}
        >
          Art Search
        </Link>
        <Link
          href="/Exhibition"
          className={isActive("/Exhibition") ? classes.activeLink : ""}
        >
          Exhibition
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
