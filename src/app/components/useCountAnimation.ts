import { useEffect, useState } from "react";

const useCountAnimation = (targetCount: number, duration: number) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (targetCount <= 0) {
      setDisplayCount(targetCount);
      return; // Early exit if targetCount is 0 or negative
    }

    const totalSteps = duration / 100;
    const stepSize = targetCount / totalSteps;

    const interval = setInterval(() => {
      setDisplayCount((prevCount) => {
        if (prevCount >= targetCount) {
          clearInterval(interval);
          return targetCount;
        }
        return Math.ceil(prevCount + stepSize);
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [targetCount, duration]);

  return displayCount;
};

export default useCountAnimation;
