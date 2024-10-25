"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { Item } from "../types";
import {
  fetchExhibitionItems,
  addExhibitionItem,
  removeExhibitionItem,
} from "../utils/exhibitionService";
import { useAuth } from "./AuthContext";

interface ExhibitionContextProps {
  exhibitionItems: Item[];
  setExhibitionItems: Dispatch<SetStateAction<Item[]>>;
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const ExhibitionContext = createContext<ExhibitionContextProps | undefined>(
  undefined
);

export const useExhibition = () => {
  const context = useContext(ExhibitionContext);
  if (!context)
    throw new Error("useExhibition must be used within ExhibitionProvider");
  return context;
};

export const ExhibitionProvider = ({ children }: { children: ReactNode }) => {
  const [exhibitionItems, setExhibitionItems] = useState<Item[]>([]);
  const { user } = useAuth();

  const fetchItems = async () => {
    if (user) {
      const items = await fetchExhibitionItems(user);
      setExhibitionItems(items);
    }
  };

  const addItem = async (item: Item) => {
    if (user) {
      await addExhibitionItem(user, item);
      setExhibitionItems((prevItems) => [...prevItems, item]);
    }
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      await removeExhibitionItem(user, itemId);
      setExhibitionItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  return (
    <ExhibitionContext.Provider
      value={{
        exhibitionItems,
        setExhibitionItems,
        fetchItems,
        addItem,
        removeItem,
      }}
    >
      {children}
    </ExhibitionContext.Provider>
  );
};
