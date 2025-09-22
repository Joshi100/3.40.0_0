import { a as createLucideIcon, c as create, r as reactExports, j as jsxRuntimeExports, S as Sparkles, A as AnimatePresence, m as motion, b as client, R as React } from './globals-BtrmDouG.js';

/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const FileText = createLucideIcon("FileText", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);

/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Loader2 = createLucideIcon("Loader2", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);

/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const MessageSquare = createLucideIcon("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);

/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Send = createLucideIcon("Send", [
  ["path", { d: "m22 2-7 20-4-9-9-4Z", key: "1q3vgg" }],
  ["path", { d: "M22 2 11 13", key: "nzbqef" }]
]);

const useSidePanelStore = create((set, get) => ({
  currentSummary: null,
  chatMessages: [],
  isLoading: false,
  summarizePage: async () => {
    set({ isLoading: true });
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "getPageContent"
      });
      if (response?.content) {
        let summary = "";
        try {
          const win = window;
          if (win.ai?.summarizer) {
            const summarizer = await win.ai.summarizer.create();
            summary = await summarizer.summarize(response.content);
          } else {
            summary = response.content.slice(0, 500) + "...";
          }
        } catch (error) {
          console.warn("AI Summarizer not available, using fallback");
          const sentences = response.content.split(". ").slice(0, 3);
          summary = sentences.join(". ") + (sentences.length === 3 ? "." : "");
        }
        set({ currentSummary: summary });
      } else {
        set({ currentSummary: "No content available to summarize on this page." });
      }
    } catch (error) {
      console.error("Failed to summarize page:", error);
      set({ currentSummary: "Failed to analyze page content." });
    } finally {
      set({ isLoading: false });
    }
  },
  sendChatMessage: async (message) => {
    const userMessage = {
      role: "user",
      content: message,
      timestamp: Date.now()
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      isLoading: true
    }));
    try {
      let response = "";
      try {
        const win = window;
        if (win.ai?.languageModel) {
          const session = await win.ai.languageModel.create({
            systemPrompt: `You are a helpful assistant that can answer questions about web pages. 
            The current page summary is: ${get().currentSummary || "No summary available"}`
          });
          response = await session.prompt(message);
        } else {
          throw new Error("AI not available");
        }
      } catch (error) {
        console.warn("Chrome AI not available, using fallback response");
        const fallbackResponses = [
          "I'd be happy to help! However, Chrome's built-in AI is not available right now. Please try again later.",
          "That's an interesting question! The AI features are currently being loaded. Please check back in a moment.",
          "I'm processing your request, but the AI service is temporarily unavailable. You can try refreshing the page."
        ];
        response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }
      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: Date.now()
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error("Failed to send chat message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your message. Please try again.",
        timestamp: Date.now()
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, errorMessage],
        isLoading: false
      }));
    }
  },
  clearChat: () => {
    set({ chatMessages: [] });
  }
}));

function SidePanelApp() {
  const {
    currentSummary,
    chatMessages,
    isLoading,
    summarizePage,
    sendChatMessage,
    clearChat
  } = useSidePanelStore();
  const [chatInput, setChatInput] = reactExports.useState("");
  const [activeTab, setActiveTab] = reactExports.useState("summary");
  reactExports.useEffect(() => {
    summarizePage();
  }, [summarizePage]);
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    await sendChatMessage(chatInput);
    setChatInput("");
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-gray-800", children: "Manage Assistant" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-1 bg-gray-100 rounded-lg p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab("summary"),
            className: `flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === "summary" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Summary" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab("chat"),
            className: `flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === "chat" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Chat" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      activeTab === "summary" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
          className: "h-full p-4 overflow-y-auto",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "Page Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: summarizePage,
                  disabled: isLoading,
                  className: "px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1",
                  children: [
                    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Refresh" })
                  ]
                }
              )
            ] }),
            isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Analyzing page content..." })
            ] }) }) : currentSummary ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 leading-relaxed", children: currentSummary }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No content to summarize" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Navigate to a page with text content" })
            ] })
          ] })
        },
        "summary"
      ),
      activeTab === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
          className: "h-full flex flex-col",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
              chatMessages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Start a conversation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Ask questions about the current page" })
              ] }) : chatMessages.map((message, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `max-w-[80%] p-3 rounded-lg ${message.role === "user" ? "bg-blue-600 text-white" : "bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800"}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: message.content })
                    }
                  )
                },
                index
              )),
              isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  className: "flex justify-start",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/80 backdrop-blur-sm border border-gray-200/50 p-3 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "w-4 h-4 animate-spin text-blue-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Thinking..." })
                  ] }) })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: chatInput,
                    onChange: (e) => setChatInput(e.target.value),
                    onKeyPress: handleKeyPress,
                    placeholder: "Ask about this page...",
                    className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    disabled: isLoading
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleSendMessage,
                    disabled: isLoading || !chatInput.trim(),
                    className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" })
                  }
                )
              ] }),
              chatMessages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: clearChat,
                  className: "mt-2 text-xs text-gray-500 hover:text-gray-700",
                  children: "Clear conversation"
                }
              )
            ] })
          ]
        },
        "chat"
      )
    ] }) })
  ] });
}

client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidePanelApp, {}) })
);
