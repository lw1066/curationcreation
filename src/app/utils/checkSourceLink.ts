export const checkSourceLink = async (sourceLink: string): Promise<boolean> => {
  if (!sourceLink) return false;

  try {
    const response = await fetch(sourceLink, {
      method: "HEAD",
      mode: "no-cors",
    });

    return response ? true : false;
  } catch {
    return false;
  }
};
