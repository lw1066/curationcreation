import React from "react";
import styles from "./loadMoreButton.module.css";

// Define the props type for the LoadMoreButton component
interface LoadMoreButtonProps {
  onClick: () => void; // Function to be called on button click
  disabled?: boolean; // Optional prop to disable the button
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.loadMoreButton}
        onClick={onClick}
        disabled={disabled}
      >
        More
      </button>
    </div>
  );
};

export default LoadMoreButton;
