import express from "express";
import Groq from "groq-sdk";
import { findRelevantProducts } from "../services/productService.js";

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;

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
    const products = await findRelevantProducts(message.trim());

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
    res.write(
      `data: ${JSON.stringify({
        type: "metadata",
        products,
      })}\n\n`
    );

    // =========================
    // STEP 4: CALL GROQ (was: Llama via Ollama)
    // =========================
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

    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", // Groq-hosted Llama model, closest to your local llama3.2
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    // =========================
    // STEP 5: STREAM RESPONSE
    // =========================
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";

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
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Groq streaming error:", error);

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