import React from "react";
import styles from "./loadMoreButton.module.css";

interface LoadMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  fontSize?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  disabled,
  text = "More",
  fontSize = "16px",
}) => {
  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.loadMoreButton}
        onClick={onClick}
        disabled={disabled}
        style={{ fontSize }}
      >
        {text}
      </button>
    </div>
  );
};

export default LoadMoreButton;
