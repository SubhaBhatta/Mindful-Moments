// Configuration object for easy customization
const CONFIG = {
  TYPING_DELAY: 1000,
  WELCOME_DELAY: 500,
  MAX_MESSAGE_LENGTH: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// State management object
const ChatState = {
  isProcessing: false,
  messageHistory: [],
  currentRetryAttempt: 0,

  setProcessing(status) {
    this.isProcessing = status;
    setFormDisabled(status);
  },

  addToHistory(message, sender, sentiment = "") {
    this.messageHistory.push({
      message,
      sender,
      sentiment,
      timestamp: new Date().toISOString(),
    });
  },

  clearHistory() {
    this.messageHistory = [];
  },

  getLastUserMessage() {
    return (
      this.messageHistory.filter((msg) => msg.sender === "user").pop()
        ?.message || ""
    );
  },
};

// Utility functions
const Utils = {
  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  },

  // Validate message length and content
  validateMessage(message) {
    if (!message || !message.trim()) {
      return { valid: false, error: "Please enter a message to analyze." };
    }

    if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
      return {
        valid: false,
        error: `Message too long. Please keep it under ${CONFIG.MAX_MESSAGE_LENGTH} characters.`,
      };
    }

    return { valid: true };
  },

  // Format timestamp for display
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Debounce function to prevent spam
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Sleep function for retry delays
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

// Enhanced form control with loading states
function setFormDisabled(isDisabled) {
  const button = document.getElementById("analyzeBtn");
  const input = document.getElementById("moodInput");

  if (button) {
    button.disabled = isDisabled;
    button.textContent = isDisabled ? "Analyzing..." : "Analyze Mood";
    button.style.cursor = isDisabled ? "not-allowed" : "pointer";
  }

  if (input) {
    input.disabled = isDisabled;
    input.style.cursor = isDisabled ? "not-allowed" : "text";
  }
}

// Enhanced message display with animations and timestamps
function addMessage(text, sender = "bot", sentiment = "", showTime = true) {
  const chatLog = document.getElementById("chat-log");

  if (!chatLog) {
    console.error("Chat log element not found");
    return;
  }

  // Create message container
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  const messageEl = document.createElement("div");
  messageEl.className = `message ${sender}`;

  // Add sentiment styling and tag for bot messages
  if (sentiment && sender === "bot") {
    const sentimentTag = document.createElement("span");
    sentimentTag.className = `sentiment-tag sentiment-${sentiment}`;
    sentimentTag.textContent = sentiment.toUpperCase();

    messageEl.appendChild(sentimentTag);
    messageEl.appendChild(document.createTextNode(Utils.sanitizeInput(text)));
  } else {
    messageEl.textContent = Utils.sanitizeInput(text);
  }

  // Add timestamp if requested
  if (showTime) {
    const timeEl = document.createElement("div");
    timeEl.className = "message-time";
    timeEl.textContent = Utils.formatTime(new Date());
    messageContainer.appendChild(messageEl);
    messageContainer.appendChild(timeEl);
  } else {
    messageContainer.appendChild(messageEl);
  }

  chatLog.appendChild(messageContainer);

  // Add to state history
  ChatState.addToHistory(text, sender, sentiment);

  // Smooth scroll to bottom with animation
  setTimeout(() => {
    chatLog.scrollTo({
      top: chatLog.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
}

// Enhanced typing indicator with animation
function createTypingIndicator() {
  const chatLog = document.getElementById("chat-log");
  const typingContainer = document.createElement("div");
  typingContainer.className = "message-container";
  typingContainer.id = "typing-container";

  const typingElement = document.createElement("div");
  typingElement.className = "message bot typing";
  typingElement.id = "typing-indicator";

  // Create animated dots
  const dotsContainer = document.createElement("span");
  dotsContainer.className = "typing-dots";

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "typing-dot";
    dot.style.animationDelay = `${i * 0.2}s`;
    dotsContainer.appendChild(dot);
  }

  typingElement.appendChild(document.createTextNode("Analyzing your mood"));
  typingElement.appendChild(dotsContainer);

  typingContainer.appendChild(typingElement);
  chatLog.appendChild(typingContainer);

  // Scroll to show typing indicator
  setTimeout(() => {
    chatLog.scrollTo({
      top: chatLog.scrollHeight,
      behavior: "smooth",
    });
  }, 100);

  return typingContainer;
}

// Enhanced typing indicator removal
function removeTypingIndicator() {
  const typingContainer = document.getElementById("typing-container");
  if (typingContainer && typingContainer.parentNode) {
    // Fade out animation
    typingContainer.style.opacity = "0";
    typingContainer.style.transform = "translateY(-10px)";

    setTimeout(() => {
      if (typingContainer.parentNode) {
        typingContainer.parentNode.removeChild(typingContainer);
      }
    }, 300);
  }
}

// Simple mood analysis function (simulates API call)
async function simulateMoodAnalysis(text) {
  // Simulate API delay
  await Utils.sleep(1500);

  // Simple sentiment analysis based on keywords
  const positiveWords = [
    "happy",
    "great",
    "awesome",
    "wonderful",
    "excited",
    "love",
    "amazing",
    "perfect",
    "fantastic",
    "good",
    "better",
    "hopeful",
    "grateful",
    "blessed",
    "joyful",
  ];
  const negativeWords = [
    "sad",
    "angry",
    "frustrated",
    "tired",
    "stressed",
    "worried",
    "anxious",
    "depressed",
    "upset",
    "bad",
    "terrible",
    "awful",
    "hate",
    "horrible",
    "disappointed",
  ];

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  let sentiment = "neutral";
  let response = "";

  if (positiveCount > negativeCount) {
    sentiment = "positive";
    response =
      "I can sense some positive emotions in your message! It sounds like you're experiencing some good feelings. That's wonderful to hear. Keep nurturing those positive thoughts!";
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
    response =
      "I notice you might be going through some challenging emotions right now. It's completely normal to feel this way sometimes. Remember that difficult feelings are temporary and it's okay to reach out for support when you need it.";
  } else {
    sentiment = "neutral";
    response =
      "Your message shows a balanced emotional state. You seem to be processing your feelings thoughtfully. This kind of self-reflection is really valuable for emotional well-being.";
  }

  return {
    reply: response,
    sentiment: sentiment,
  };
}

// Enhanced mood analysis function with comprehensive error handling
const analyzeMood = Utils.debounce(async () => {
  // Prevent multiple simultaneous requests
  if (ChatState.isProcessing) {
    console.log("Already processing a request");
    return;
  }

  const inputElement = document.getElementById("moodInput");
  const messageText = inputElement?.value?.trim() || "";

  // Validate input
  const validation = Utils.validateMessage(messageText);
  if (!validation.valid) {
    addMessage(validation.error, "bot", "neutral");
    return;
  }

  // Set processing state
  ChatState.setProcessing(true);

  // Add user message to chat
  addMessage(messageText, "user");

  // Clear input
  if (inputElement) {
    inputElement.value = "";
    inputElement.style.height = "auto"; // Reset textarea height if auto-resizing
  }

  // Show typing indicator with delay for better UX
  setTimeout(() => {
    const typingIndicator = createTypingIndicator();
  }, 300);

  try {
    const data = await simulateMoodAnalysis(messageText);

    // Remove typing indicator
    removeTypingIndicator();

    // Add bot response with animation delay
    setTimeout(() => {
      addMessage(data.reply, "bot", data.sentiment || "neutral");

      // Optional: Add follow-up suggestions based on sentiment
      if (data.sentiment === "negative") {
        setTimeout(() => {
          addMessage(
            "Would you like some suggestions for improving your mood? I can provide some helpful resources.",
            "bot",
            "positive"
          );
        }, 1500);
      }
    }, 500);
  } catch (error) {
    removeTypingIndicator();
    console.error("Failed to analyze mood:", error);

    // Enhanced error messages
    let errorMessage =
      "I'm having trouble analyzing your mood right now. Let me try to help you anyway.";
    let errorSentiment = "negative";

    addMessage(errorMessage, "bot", errorSentiment);

    // Offer offline suggestions for negative sentiment detection
    if (
      messageText.toLowerCase().includes("sad") ||
      messageText.toLowerCase().includes("depressed") ||
      messageText.toLowerCase().includes("anxious")
    ) {
      setTimeout(() => {
        addMessage(
          "Even though I can't analyze your mood right now, I noticed you might be feeling down. Remember that it's okay to feel this way, and consider reaching out to friends, family, or a mental health professional if needed.",
          "bot",
          "positive"
        );
      }, 1000);
    }
  } finally {
    // Reset processing state
    ChatState.setProcessing(false);

    // Focus back on input for better UX
    setTimeout(() => {
      if (inputElement && !inputElement.disabled) {
        inputElement.focus();
      }
    }, 500);
  }
}, 300); // 300ms debounce to prevent spam

// Enhanced keyboard handling with better UX
function handleKeyPress(event) {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      // Allow Shift+Enter for new lines
      return;
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl+Enter or Cmd+Enter also submits
      event.preventDefault();
      analyzeMood();
    } else {
      // Regular Enter submits
      event.preventDefault();
      analyzeMood();
    }
  } else if (event.key === "Escape") {
    // Escape clears the input
    event.target.value = "";
  }
}

// Auto-resize textarea functionality
function handleTextareaResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
}

// Enhanced chat clearing functionality
function clearChat() {
  const chatLog = document.getElementById("chat-log");
  if (chatLog) {
    chatLog.innerHTML = "";
    ChatState.clearHistory();

    // Re-add welcome message
    setTimeout(() => {
      addMessage(
        "Chat cleared! I'm ready to help analyze your mood again.",
        "bot",
        "positive"
      );
    }, 300);
  }
}

// Export chat functionality
function exportChat() {
  if (ChatState.messageHistory.length === 0) {
    addMessage("No messages to export yet!", "bot", "neutral");
    return;
  }

  const exportData = {
    timestamp: new Date().toISOString(),
    messages: ChatState.messageHistory,
    totalMessages: ChatState.messageHistory.length,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mood-analysis-chat-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  addMessage("Chat history exported successfully!", "bot", "positive");
}

// Add chat control buttons (clear, export, etc.)
function addChatControls() {
  const chatLog = document.getElementById("chat-log");
  if (!chatLog) return;

  // Create controls container
  const controlsContainer = document.createElement("div");
  controlsContainer.className = "chat-controls";
  controlsContainer.innerHTML = `
                <button type="button" class="control-btn" onclick="clearChat()" title="Clear chat history">
                    🗑️ Clear
                </button>
                <button type="button" class="control-btn" onclick="exportChat()" title="Export chat history">
                    📤 Export
                </button>
            `;

  // Insert before chat log
  chatLog.parentNode.insertBefore(controlsContainer, chatLog);
}

// Enhanced initialization with better error handling and features
function initializeChat() {
  try {
    const input = document.getElementById("moodInput");
    const button = document.getElementById("analyzeBtn");

    // Enhanced textarea setup
    if (input) {
      // Add event listeners
      input.addEventListener("keypress", handleKeyPress);
      input.addEventListener("input", (e) => handleTextareaResize(e.target));
      input.addEventListener("paste", (e) => {
        setTimeout(() => handleTextareaResize(e.target), 0);
      });

      // Focus and setup
      input.focus();
      input.placeholder =
        "Tell me how you're feeling today... (Press Enter to send, Shift+Enter for new line)";

      // Initial resize
      handleTextareaResize(input);
    }

    // Enhanced button setup
    if (button) {
      // Remove existing onclick if any
      button.removeAttribute("onclick");
      button.addEventListener("click", (e) => {
        e.preventDefault();
        analyzeMood();
      });

      // Add loading state styles
      button.style.transition = "all 0.3s ease";
    }

    // Add welcome message with personality
    setTimeout(() => {
      addMessage(
        "Hello! I'm your AI mood analysis assistant. Share your thoughts, feelings, or describe your day, and I'll help you understand the emotions behind your words. 🧠✨",
        "bot",
        "positive"
      );
    }, CONFIG.WELCOME_DELAY);

    // Add chat controls
    addChatControls();

    console.log("Mood analysis chat initialized successfully");
  } catch (error) {
    console.error("Failed to initialize chat:", error);

    // Fallback initialization
    setTimeout(() => {
      addMessage(
        "There was an issue setting up the chat, but I'm still here to help! You can click the button to analyze your mood.",
        "bot",
        "neutral"
      );
    }, 1000);
  }
}

// Enhanced auto-initialization with error recovery
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeChat);
} else {
  // DOM is already loaded
  if (
    document.getElementById("moodInput") &&
    document.getElementById("analyzeBtn")
  ) {
    initializeChat();
  } else {
    // Wait a bit more for elements to load
    setTimeout(initializeChat, 100);
  }
}

// Global error handler for unhandled promises
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);

  if (ChatState.isProcessing) {
    removeTypingIndicator();
    ChatState.setProcessing(false);
    addMessage(
      "Something unexpected happened. Please try again.",
      "bot",
      "negative"
    );
  }
});

// Make key functions globally available
window.analyzeMood = analyzeMood;
window.clearChat = clearChat;
window.exportChat = exportChat;
