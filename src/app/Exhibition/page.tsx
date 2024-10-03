"use client";

import { useState, useEffect } from "react";
import classes from "./exhibition.module.css";
import ExhibitionItem from "../components/ExhibitionItem";

interface Item {
  id: string;
  // Define other necessary properties of Item here
}

const ExhibitionPage = () => {
  const [exhibitionItems, setExhibitionItems] = useState<Item[]>([]);

  // Load exhibition items from localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem("exhibitionItems");
    if (storedItems) {
      setExhibitionItems(JSON.parse(storedItems));
    }
  }, []);

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = exhibitionItems.filter((item) => item.id !== itemId);
    localStorage.setItem("exhibitionItems", JSON.stringify(updatedItems));
    setExhibitionItems(updatedItems);
  };

  return (
    <div className={classes.exhibitionPage}>
      <h1 className={classes.greeting}>
        There are {exhibitionItems.length} item
        {exhibitionItems.length !== 1 ? "s" : ""} in your exhibition
      </h1>

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
  );
};

export default ExhibitionPage;
