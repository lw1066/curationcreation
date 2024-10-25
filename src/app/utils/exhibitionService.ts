import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Item } from "../types";
import { User } from "firebase/auth";

// Fetch exhibition items for a given user
export const fetchExhibitionItems = async (
  currentUser: User | null
): Promise<Item[]> => {
  if (!currentUser) return [];

  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data()?.items || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching exhibition items from Firestore:", error);
    return [];
  }
};

// Add an item to the exhibition items array for a given user
export const addExhibitionItem = async (
  user: User,
  item: Item
): Promise<void> => {
  if (!user) throw new Error("User must be logged in to add an item.");

  const userDocRef = doc(db, "users", user.uid);

  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      // Document exists, update the items array
      await updateDoc(userDocRef, {
        items: arrayUnion(item), // Use arrayUnion to add the item to the array
      });
    } else {
      // Document does not exist, create it with the items array
      await setDoc(userDocRef, {
        items: [item], // Initialize the array with the new item
      });
    }
    console.log("Exhibition item added successfully.");
  } catch (error) {
    console.error("Error adding exhibition item:", error);
    throw error;
  }
};

// Remove an item from the exhibition items array for a given user
export const removeExhibitionItem = async (
  user: User,
  itemId: string
): Promise<void> => {
  if (!user) throw new Error("User must be logged in to remove an item.");

  try {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const existingItems = docSnap.data()?.items || [];
      const itemToRemove = existingItems.find(
        (item: Item) => item.id === itemId
      );

      if (itemToRemove) {
        await updateDoc(userDocRef, {
          items: arrayRemove(itemToRemove), // Use arrayRemove to remove the item from the array
        });
        console.log("Exhibition item removed successfully.");
      } else {
        console.log("Item not found in exhibition items.");
      }
    } else {
      console.log("User document does not exist.");
    }
  } catch (error) {
    console.error("Error removing exhibition item:", error);
    throw error;
  }
};
