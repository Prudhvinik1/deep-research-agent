'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingResponseProps {
  data: Record<string, unknown>[];
  isResearching: boolean;
  streamingText: string;
  currentQuery: string;
}

export function StreamingResponse({ data, isResearching, streamingText, currentQuery }: StreamingResponseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data, streamingText]);

  if (data.length === 0 && !isResearching) {
    return null;
  }

  const getStatusMessage = () => {
    const lastEvent = data[data.length - 1];
    if (!lastEvent) return '';

    switch (lastEvent.type) {
      case 'start':
        return 'Starting research...';
      case 'search_start':
        return 'Searching the web...';
      case 'search_complete':
        return `Found ${lastEvent.sources_found as number} sources`;
      case 'analysis_start':
        return 'Analyzing with AI...';
      case 'ai_thinking':
        return 'AI is processing...';
      case 'analysis_complete':
        return 'Analysis complete';
      case 'complete':
        return 'Research completed';
      case 'error':
        return `Error: ${lastEvent.message as string}`;
      default:
        return '';
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="mt-8 space-y-6">
      {/* Status Bar */}
      {(isResearching || statusMessage) && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isResearching && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {isResearching ? 'Researching...' : statusMessage}
              </span>
            </div>
            {isResearching && (
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                Live
              </div>
            )}
          </div>
        </div>
      )}

      {/* Markdown Output Frame */}
      {(streamingText || currentQuery) && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-800">
                  {currentQuery ? `Research: ${currentQuery}` : 'Research Output'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                  Markdown
                </span>
                <span className="text-xs text-gray-400">
                  {streamingText.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div 
            ref={scrollRef}
            className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto prose prose-sm max-w-none"
            style={{ scrollbarWidth: 'thin' }}
          >
            {streamingText ? (
              <div className="text-gray-800 leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="mb-4 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700 flex items-start"><span className="text-blue-500 mr-2">•</span>{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                    code: ({children}) => <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                    pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                  }}
                >
                  {streamingText}
                </ReactMarkdown>
                {isResearching && (
                  <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                )}
              </div>
            ) : (
              <div className="text-gray-400 italic text-center py-8">
                {isResearching ? 'Waiting for AI response...' : 'No output yet'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources List */}
      {data.some(item => item.type === 'search_result') && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-800">Sources</span>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                {data.filter(item => item.type === 'search_result').length} found
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data
                .filter(item => item.type === 'search_result')
                .map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {item.index as number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={item.url as string} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
                      >
                        {item.title as string}
                      </a>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {item.url as string}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}