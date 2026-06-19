'use client';

import React, { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import { MessageSquare, X, Send, Bot, HelpCircle, Sparkles } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'How can I reduce my transport emissions?',
  "What's my biggest impact area?",
  'Give me a 7-day eco challenge',
];

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm EcoBot, your personal carbon footprint assistant. Ask me anything about your emissions or how you can build a more sustainable lifestyle today!",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Initialize SSE connection
      const response = await fetch('/api/ai/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tips');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No stream reader');

      setIsTyping(false);
      // Insert initial empty assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                assistantText += data.text;
                // Update the last message content
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  updated[lastIndex] = { role: 'assistant', content: assistantText };
                  return updated;
                });
              }
            } catch {
              // Ignore parse errors on partial streams
            }
          }
        }
      }
    } catch (error) {
      logger.error('AIChat', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please check your Anthropic API Key or try again later.',
        },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col items-end">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant Chat"
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 duration-100 cursor-pointer relative group"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-slate-50 animate-pulse" />
          {/* Tooltip */}
          <div className="absolute right-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Ask EcoBot
          </div>
        </button>
      )}

      {/* Slide-out Chat Panel */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[500px] flex flex-col bg-white border border-gray-250 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-green-400" />
              <div>
                <CardTitle className="text-white text-sm font-bold flex items-center gap-1">
                  EcoBot AI Assistant
                  <Sparkles className="h-3 w-3 text-amber-400 fill-current" />
                </CardTitle>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-ping" />
                  <span>Online & ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Chat"
              className="p-1 hover:bg-slate-800 text-gray-400 hover:text-white rounded-md transition"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>

          {/* Messages view */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => {
              const isBot = msg.role === 'assistant';
              return (
                <div key={index} className={`flex ${isBot ? 'justify-start' : 'justify-end'} items-start space-x-2`}>
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-green-150 text-green-700 flex items-center justify-center shrink-0 border border-green-200">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                      isBot
                        ? 'bg-white border border-gray-200 text-slate-800 rounded-tl-none'
                        : 'bg-green-600 text-white rounded-tr-none'
                    }`}
                  >
                    {msg.content || (
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                  {!isBot && (
                    <div className="w-7 h-7 rounded-full bg-green-800 text-white flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                      U
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-green-150 text-green-700 flex items-center justify-center shrink-0 border border-green-200">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm text-xs text-gray-500">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Suggested Prompts
              </span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] text-gray-600 border border-gray-200 hover:border-green-400 hover:bg-green-50/50 bg-slate-50 px-2.5 py-1.5 rounded-full text-left transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-gray-150 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              className="flex-1 focus-visible:ring-offset-0 focus-visible:ring-1"
            />
            <Button
              size="icon"
              onClick={() => handleSendMessage(inputValue)}
              className="w-10 h-10 shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
