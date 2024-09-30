import React from "react";
import classes from "./triangleButton.module.css";

// Define the props type for the TriangleButton component
interface TriangleButtonProps {
  onClick: () => void;
  text: string;
  textColor?: string; // Optional prop
}

const TriangleButton: React.FC<TriangleButtonProps> = ({
  onClick,
  text,
  textColor = "white",
}) => {
  return (
    <button className={classes.triangleButton} onClick={onClick}>
      <span
        className={classes.buttonText}
        style={{
          color: textColor,
          transform: "rotate(45deg)",
          fontSize: "12px",
        }}
      >
        {text}
      </span>
    </button>
  );
};

export default TriangleButton;
