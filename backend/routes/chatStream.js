import express from "express";
import multer from "multer";
import Groq from "groq-sdk";

import {
  findRelevantProducts,
  findProductsByCategory,
} from "../services/productService.js";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed"
        )
      );
    }
  },
});

router.post(
  "/api/chat/stream",
  upload.single("image"),
  async (req, res) => {
    const message = req.body.message?.trim() || "";
    const image = req.file;

    if (!message && !image) {
      return res.status(400).json({
        message: "Message or image is required",
      });
    }

    

    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.flushHeaders();

    try {
      let products = [];


      if (image) {
        console.log(
          "IMAGE SEARCH REQUEST"
        );

        const base64Image =
          image.buffer.toString("base64");

        const imageDataUrl =
          `data:${image.mimetype};base64,${base64Image}`;

        const visionResponse =
          await groq.chat.completions.create({
            model: "qwen/qwen3.6-27b",

            messages: [
              {
                role: "user",

                content: [
                  {
                    type: "text",

                    text: `
Identify the main ecommerce product shown in this image.

Return ONLY JSON:

{
  "productType": "category name"
}

Rules:
- Identify only the main product.
- Ignore color.
- Ignore background.
- Ignore decorative details.
- Do not include brand names.
- Do not include product-specific descriptions.
- Use a simple generic category name.

Examples:

Football image:
{
  "productType": "football"
}

Sofa image:
{
  "productType": "sofa"
}

Running shoe image:
{
  "productType": "shoes"
}
`,
                  },

                  {
                    type: "image_url",

                    image_url: {
                      url: imageDataUrl,
                    },
                  },
                ],
              },
            ],

            response_format: {
              type: "json_object",
            },

            temperature: 0,
          });

        const visionText =
          visionResponse.choices[0]?.message?.content;

        console.log(
          "VISION RESULT:",
          visionText
        );

        if (!visionText) {
          throw new Error(
            "Could not analyze the image"
          );
        }

        let visionResult;

        try {
          visionResult =
            JSON.parse(visionText);
        } catch {
          throw new Error(
            "Invalid image analysis response"
          );
        }

        const productType =
          visionResult.productType
            ?.trim()
            .toLowerCase();

        console.log(
          "PRODUCT TYPE:",
          productType
        );

        if (!productType) {
          throw new Error(
            "Could not identify the product type"
          );
        }

       
        products =
          await findProductsByCategory(
            productType
          );

        console.log(
          "PRODUCTS FOUND:",
          products.length
        );
      }


      else {
        products =
          await findRelevantProducts(
            message
          );

        console.log(
          "TEXT PRODUCTS FOUND:",
          products.length
        );
      }

      const contextText =
        products.length > 0
          ? products
              .map(
                (product) => `
Name: ${product.name}
Brand: ${product.brand || ""}
Price: $${product.price}
Description: ${
                  product.description || ""
                }
`
              )
              .join("\n")
          : "No relevant products found.";

      

      res.write(
        `data: ${JSON.stringify({
          type: "metadata",
          products,
        })}\n\n`
      );


      const customerMessage =
        message ||
        "The customer uploaded an image and wants to find relevant products.";

      const prompt = `
You are a helpful ecommerce sales assistant.

Use ONLY the products provided below.

PRODUCTS:
${contextText}

CUSTOMER:
${customerMessage}

Rules:
- Only recommend products from the provided products.
- Do not invent products.
- Do not invent prices.
- Do not invent features.
- If no products were found, clearly tell the customer that no matching products are currently available.
- Keep the answer friendly and concise.
`;

      const stream =
        await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          stream: true,
        });

      

      for await (const chunk of stream) {
        const text =
          chunk.choices[0]?.delta?.content ||
          "";

        if (text) {
          res.write(
            `data: ${JSON.stringify({
              type: "text",
              chunk: text,
            })}\n\n`
          );
        }
      }

     

      res.write(
        "data: [DONE]\n\n"
      );

      res.end();

      console.log(
        "CHAT COMPLETED"
      );
    } catch (error) {
      console.error(
        "Groq chat error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          message:
            error.message ||
            "Failed to generate AI response",
        });
      }

      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error:
            error.message ||
            "Failed to generate AI response",
        })}\n\n`
      );

      res.write(
        "data: [DONE]\n\n"
      );

      res.end();
    }
  }
);

export default router;