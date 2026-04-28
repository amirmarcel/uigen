"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolInvocationBadge } from "./ToolInvocationBadge";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 mb-5 shadow-lg shadow-blue-200">
          <Bot className="h-7 w-7 text-white" />
        </div>
        <p className="text-neutral-900 font-semibold text-lg mb-1.5">Start a conversation</p>
        <p className="text-neutral-400 text-sm max-w-xs">Describe a component and I'll generate it for you</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
                  <Bot className="h-4 w-4 text-neutral-600" />
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              message.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3",
                message.role === "user"
                  ? "rounded-2xl rounded-br-sm bg-blue-600 text-white"
                  : "rounded-2xl rounded-bl-sm bg-white text-neutral-900 border border-neutral-100"
              )}>
                <div className="text-sm">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">{part.text}</span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div key={partIndex} className="mt-3 p-3 bg-white/50 rounded-md border border-neutral-200">
                                <span className="text-xs font-medium text-neutral-600 block mb-1">Reasoning</span>
                                <span className="text-sm text-neutral-700">{part.reasoning}</span>
                              </div>
                            );
                          case "tool-invocation":
                            return (
                              <ToolInvocationBadge key={partIndex} toolInvocation={part.toolInvocation} />
                            );
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs text-neutral-500">
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? <hr key={partIndex} className="my-3 border-neutral-200" /> : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-1 mt-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shadow-blue-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}