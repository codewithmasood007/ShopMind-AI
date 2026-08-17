import { useState } from "react";

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");

    // Create empty AI message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        products: [],
      },
    ]);

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to connect to AI");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop();

        for (const event of events) {
          if (!event.startsWith("data: ")) {
            continue;
          }

          const data = event.replace("data: ", "");

          if (data === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "metadata") {
              setMessages((prev) => {
                const updated = [...prev];

                const lastMessage = updated[updated.length - 1];

                if (lastMessage?.role === "assistant") {
                  lastMessage.products = parsed.products || [];
                }

                return updated;
              });
            }

            if (parsed.type === "text") {
              setMessages((prev) => {
                const updated = [...prev];

                const lastMessage = updated[updated.length - 1];

                if (lastMessage?.role === "assistant") {
                  lastMessage.content += parsed.chunk;
                }

                return updated;
              });
            }

            if (parsed.type === "error") {
              setMessages((prev) => {
                const updated = [...prev];

                const lastMessage = updated[updated.length - 1];

                if (lastMessage?.role === "assistant") {
                  lastMessage.content = parsed.error;
                }

                return updated;
              });
            }
          } catch (error) {
            console.error("SSE parsing error:", error);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => {
        const updated = [...prev];

        const lastMessage = updated[updated.length - 1];

        if (lastMessage?.role === "assistant") {
          lastMessage.content =
            "Sorry, I couldn't connect to the AI assistant.";
        }

        return updated;
      });
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-pink-500 text-2xl shadow-lg transition hover:scale-105"
      >
        🤖
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-xl bg-gray-900 text-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-pink-500 p-4">
            <div>
              <h2 className="font-bold">
                ShopMind AI
              </h2>

              <p className="text-xs">
                Powered by Llama 3.2
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400">
                <p className="text-lg">
                  👋 Hello!
                </p>

                <p className="mt-2 text-sm">
                  Ask me about our products.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[80%] rounded-lg bg-pink-500 p-3"
                      : "max-w-[90%] rounded-lg bg-gray-800 p-3"
                  }
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {msg.content}
                  </p>

                  {/* Products */}
                  {msg.products?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product._id}
                          className="rounded-lg bg-gray-700 p-3"
                        >
                          <p className="font-semibold">
                            {product.name}
                          </p>

                          <p className="text-pink-300">
                            ${product.price}
                          </p>

                          <p className="mt-1 text-xs text-gray-300">
                            {product.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex border-t border-gray-700 p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask about products..."
              className="flex-1 rounded-l-lg bg-gray-800 px-3 py-2 text-sm outline-none"
            />

            <button
              onClick={sendMessage}
              className="rounded-r-lg bg-pink-500 px-4 font-bold hover:bg-pink-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;