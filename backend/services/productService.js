import Product from "../models/productModel.js";
import Category from "../models/categoryModels.js";

export const findRelevantProducts = async (searchInput) => {
  try {
    let searchWords = [];

    if (Array.isArray(searchInput)) {
      searchWords = searchInput
        .filter((word) => typeof word === "string")
        .map((word) => word.toLowerCase().trim())
        .filter((word) => word.length > 2);
    } else if (typeof searchInput === "string") {
      searchWords = searchInput
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2);
    }

    if (searchWords.length === 0) {
      return [];
    }

    const regex = new RegExp(searchWords.join("|"), "i");

    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { brand: regex },
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



export const findProductsByCategory = async (productType) => {
  try {
    if (
      !productType ||
      typeof productType !== "string"
    ) {
      return [];
    }

    const category = await Category.findOne({
      name: {
        $regex: `^${productType.trim()}$`,
        $options: "i",
      },
    }).lean();

    // Category doesn't exist
    if (!category) {
      console.log(
        "Category not found:",
        productType
      );

      return [];
    }

    const products = await Product.find({
      category: category._id,
    })
      .limit(5)
      .lean();

    // Category exists but has no products
    if (products.length === 0) {
      console.log(
        "Category exists but has no products:",
        category.name
      );

      return [];
    }

    return products;
  } catch (error) {
    console.error(
      "Category product retrieval error:",
      error
    );

    return [];
  }
};