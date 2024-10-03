import React from "react";
import styles from "./loadMoreButton.module.css";

interface LoadMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  fontSize?: string;
  width?: string;
  height?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  disabled,
  text = "More",
  fontSize = "12px",
  width = "40px",
  height = "40px",
}) => {
  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.loadMoreButton}
        onClick={onClick}
        disabled={disabled}
        style={{ fontSize, width, height }}
      >
        {text}
      </button>
    </div>
  );
};

export default LoadMoreButton;
