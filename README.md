# AgriBot: Smart AI Agriculture Assistant

AgriBot is a comprehensive AI-powered assistant designed to empower farmers with real-time, context-aware agricultural guidance. It combines the intelligence of **Google Gemini** with live weather data and image analysis to provide practical solutions for modern farming.

## 🌟 Key Features

- **Multi-Chat System**: Manage multiple independent conversations simultaneously. Each chat is stored in your browser's `localStorage`.
- **Crop-Specific Context**: Select your crop (Sugarcane, Rice, Tomato, etc.) when starting a new chat. AgriBot tailors all advice specifically to that crop.
- **Real-Time Weather Integration**: Automatically fetches local weather data (Temperature, Humidity, Wind Speed) to provide timely farming advice.
- **Image Analysis (File Upload)**: Upload photos of your crops to get AI-powered suggestions for pest control and disease identification.
- **Voice Input**: Hands-free interaction using browser-based speech recognition.
- **Smart Suggestions**: Quick-reply buttons and context-aware prompts to guide your queries.
- **Typing Indicator**: Visual feedback when AgriBot is analyzing your request.
- **Safety First**: Built-in disclaimers for critical agricultural decisions.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (icons), Motion (animations).
- **Backend**: Node.js, Express.
- **AI Engine**: Google Gemini API (`gemini-3.1-flash-lite-preview`).
- **Weather Data**: Open-Meteo API (Free, no key required).
- **Persistence**: Browser `localStorage` for chat history.

## 📁 Project Structure

```text
├── src/
│   ├── App.tsx          # Main interface with multi-chat logic and sidebar
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles and Tailwind configuration
├── server.ts            # Express server handling Gemini API requests
├── .env.example         # Template for your Gemini API key
├── package.json         # Project dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🚀 Setup Instructions

### 1. Prerequisites

- **Node.js** (v18 or higher)
- **Google Gemini API Key**: Get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Installation

Clone the repository and install the necessary packages:

```bash
npm install
```

### 3. Configuration

Create a `.env` file in the root directory and add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

*Note: Never share your `.env` file or commit it to version control.*

### 4. Running the Application

Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## 📖 How to Use

1. **Start a New Chat**: Click the **"New Conversation"** button in the sidebar.
2. **Select a Crop**: Choose the crop you want to discuss from the modal. This sets the context for the AI.
3. **Ask or Upload**:
   - Type a question about pests, fertilizers, or planting.
   - Click the **Image** icon to upload a photo of a leaf or crop for analysis.
   - Click the **Microphone** icon to speak your query.
4. **Switch Chats**: Use the sidebar to jump between different crop conversations.
5. **Weather Advice**: Check the weather widget in the header; AgriBot uses this data to refine its suggestions.
6. **Quick Actions**: Use smart suggestion buttons for faster queries.
7. **Clear Chat**: Use the trash icon to delete a conversation if needed.

## 🛡️ Security & Privacy

- **API Security**: Your Gemini API key is stored on the server side and is never exposed to the browser.
- **Data Privacy**: Chat history is stored locally in your browser's `localStorage` and is not sent to any external database (except for the message content sent to the Gemini API for processing).

---

*AgriBot: Bridging the gap between advanced AI and traditional farming for a more productive future.*
