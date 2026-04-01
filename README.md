# AgriBot: AI Agriculture Assistant Chatbot

AgriBot is a smart AI-powered chatbot designed to assist farmers with crop suggestions, weather-based advice, fertilizer recommendations, and pest control strategies. It uses the **Google Gemini API** for intelligent responses.

## Features

- **Interactive Chat Interface**: Clean and responsive UI built with React and Tailwind CSS.
- **AI-Powered Advice**: Leverages Google Gemini for expert-level agricultural guidance.
- **Quick Actions**: Predefined buttons for common agricultural queries.
- **Chat History**: Keeps track of your conversation context.
- **Loading Indicators**: Visual feedback while the AI generates a response.
- **Error Handling**: Graceful handling of API failures or network issues.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React (icons), Motion (animations).
- **Backend**: Node.js, Express.
- **AI Engine**: Google Gemini API (@google/genai).

## Project Structure

```text
├── src/
│   ├── App.tsx          # Main chat interface and logic
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles (Tailwind)
├── server.ts            # Express server with Gemini integration
├── .env.example         # Template for environment variables
├── package.json         # Project dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key. You can get one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 3. Configuration

Create a `.env` file in the root directory and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Running the App

Start the development server (both frontend and backend):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## How to Use

1. **Ask a Question**: Type your agricultural query in the input field (e.g., "What crops grow well in sandy soil?").
2. **Use Quick Actions**: Click on any of the predefined buttons like "Crop Suggestions" or "Pest Control" to get started quickly.
3. **Clear Chat**: Use the trash icon in the header to reset the conversation.
<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/1d0b73c5-f768-4da7-9ea5-cc77ff29e1cb" />
<img width="625" height="856" alt="image" src="https://github.com/user-attachments/assets/b021852d-9456-4470-9cc1-39e873cd0ab9" />


## Security Note

The API key is stored securely in the backend (`server.ts`) and is never exposed to the client-side code. Always use environment variables for sensitive keys.

---

*Developed for farmers to bridge the gap between AI technology and traditional agriculture.*
