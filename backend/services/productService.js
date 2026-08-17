import Product from "../models/productModel.js";

export const findRelevantProducts = async (message) => {
  try {
    const searchWords = message
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    if (searchWords.length === 0) {
      return [];
    }

    const regex = new RegExp(searchWords.join("|"), "i");

    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
      ],
    })
      .limit(5)
      .lean();

    return products;
  } catch (error) {
    console.error("Product retrieval error:", error);

    return [];
  }
};