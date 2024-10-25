import axios from "axios";

export const fetchFullInfo = async (id: string) => {
  try {
    const response = await axios.post("/api/va-full-info", { id });
    return response.data.data.vaFullItem;
  } catch (err) {
    throw new Error(`An error occurred: ${err}`);
  }
};
