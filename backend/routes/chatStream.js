import express from "express";
import ollama from "ollama";
import { findRelevantProducts } from "../services/productService.js";

const router = express.Router();

router.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;

  // console.log("=================================");
  // console.log("CHAT REQUEST RECEIVED");
  // console.log("MESSAGE:", message);

  // Validate message
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  try {
    // =========================
    // STEP 1: FIND PRODUCTS
    // =========================

    // console.log("STEP 1: Finding products...");

    const products = await findRelevantProducts(message.trim());

    // console.log("STEP 2: Products found:", products.length);

    // =========================
    // STEP 2: CREATE CONTEXT
    // =========================

    const contextText =
      products.length > 0
        ? products
            .map(
              (product) => `
Name: ${product.name}
Price: $${product.price}
Description: ${product.description || ""}
`
            )
            .join("\n")
        : "No relevant products found.";

    // =========================
    // STEP 3: SEND PRODUCTS
    // =========================

    // console.log("STEP 3: Sending metadata...");

    res.write(
      `data: ${JSON.stringify({
        type: "metadata",
        products,
      })}\n\n`
    );

    // =========================
    // STEP 4: CALL LLAMA
    // =========================

    // console.log("STEP 4: Calling Llama...");

    const prompt = `
You are a helpful ecommerce sales assistant.

Use ONLY the following product information.

PRODUCTS:
${contextText}

CUSTOMER:
${message}

Rules:
- Only recommend products from the provided products.
- Do not invent products.
- Do not invent prices.
- Do not invent features.
- If there are no relevant products, say so.
- Keep the answer friendly and concise.
`;

    const response = await ollama.chat({
      model: "llama3.2",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      stream: true,
    });

    // console.log("STEP 5: Llama connected!");

    // =========================
    // STEP 5: STREAM RESPONSE
    // =========================

    for await (const chunk of response) {
      const text = chunk.message?.content;

      // console.log("LLAMA CHUNK:", text);

      if (text) {
        res.write(
          `data: ${JSON.stringify({
            type: "text",
            chunk: text,
          })}\n\n`
        );
      }
    }

    // =========================
    // STEP 6: FINISH
    // =========================

    // console.log("STEP 6: Llama finished");

    res.write("data: [DONE]\n\n");

    res.end();

    // console.log("STEP 7: Response ended");
  } catch (error) {
    console.error("Llama streaming error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate AI response",
      });
    }

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: error.message,
      })}\n\n`
    );

    res.write("data: [DONE]\n\n");

    res.end();
  }
});

export default router;