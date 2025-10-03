# Deep Research Assistant - Frontend

A modern Next.js frontend for the Deep Research Assistant that provides real-time streaming of research results.

## Features

- **Real-time Streaming**: See research progress as it happens with Server-Sent Events
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Interactive Components**: 
  - Search input with loading states
  - Streaming response display with different message types
  - Auto-scrolling progress feed
- **TypeScript**: Full type safety throughout the application

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The frontend connects to the FastAPI backend running on `http://127.0.0.1:8000` through Next.js API rewrites. Make sure the backend is running before using the frontend.

## Components

- **SearchInput**: Handles user query input with loading states
- **StreamingResponse**: Displays real-time research progress and results
- **Main Page**: Orchestrates the research flow and state management

## Streaming Events

The frontend handles these streaming event types:
- `start`: Research begins
- `search_start`: Web search starts
- `search_result`: Each search result found
- `search_complete`: Search phase complete
- `analysis_start`: AI analysis begins
- `ai_thinking`: AI processing
- `ai_chunk`: Each piece of AI response
- `analysis_complete`: AI analysis done
- `complete`: Research finished
- `error`: Error occurred

## Styling

Built with Tailwind CSS for responsive, modern design with:
- Gradient backgrounds
- Smooth animations
- Custom scrollbars
- Loading states
- Color-coded message types