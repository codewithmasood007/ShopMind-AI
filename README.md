# 🛍️ ShopMind AI

ShopMind AI is a full-stack MERN e-commerce application with an
AI-powered multimodal product search system.

Users can find products using **text, images, or both**.

## ✨ Features

- 🛒 Full e-commerce functionality
- 🔐 User authentication & authorization
- 🔎 Product search and filtering
- ⭐ Product reviews & ratings
- 🛍️ Shopping cart & orders
- 💳 Razorpay payment integration
- 👨‍💼 Admin dashboard
- ☁️ Cloudinary image storage

### 🤖 AI Product Search

- Search products using natural language
- Upload an image to find related products
- Combine image + text queries
- AI-powered shopping assistant
- Streaming AI responses
- Returns only products available in the database

### 🖼️ Image Search

```text
User uploads image
        ↓
AI identifies product type
        ↓
Find matching category
        ↓
Search MongoDB
        ↓
Return available products