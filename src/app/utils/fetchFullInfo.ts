import axios from "axios";

export const fetchFullInfo = async (id: string) => {
  try {
    console.log(id);
    const response = await axios.post("/api/va-full-info", { id });
    console.log(response);
    return response.data.data.vaFullItem;
  } catch (err) {
    throw new Error(`An error occurred: ${err}`);
  }
};
