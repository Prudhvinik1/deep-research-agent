'use client';

import { useState } from 'react';
import { SearchInput } from '@/components/SearchInput';
import { StreamingResponse } from '@/components/StreamingResponse';

export default function Home() {
  const [isResearching, setIsResearching] = useState(false);
  const [researchData, setResearchData] = useState<Record<string, unknown>[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');

  const handleResearch = async (query: string) => {
    setIsResearching(true);
    setResearchData([]);
    setStreamingText('');
    setCurrentQuery(query);

    try {
      const response = await fetch('http://127.0.0.1:8000/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to start research');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setResearchData(prev => [...prev, data]);
              
              // Handle AI chunks for streaming text
              if (data.type === 'ai_chunk') {
                setStreamingText(prev => prev + data.content);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Research error:', error);
      setResearchData(prev => [...prev, { 
        type: 'error', 
        message: 'Failed to complete research. Please try again.' 
      }]);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Research Assistant
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Ask any question and get comprehensive research results with AI-powered analysis
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <SearchInput 
              onSearch={handleResearch} 
              disabled={isResearching}
            />
          </div>

          <StreamingResponse 
            data={researchData}
            isResearching={isResearching}
            streamingText={streamingText}
            currentQuery={currentQuery}
          />
        </div>
      </div>
    </div>
  );
}