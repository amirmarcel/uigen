"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useChat as useAIChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useFileSystem } from "./file-system-context";
import { setHasAnonWork } from "@/lib/anon-work-tracker";

interface ChatContextProps {
  projectId?: string;
  initialMessages?: UIMessage[];
}

interface ChatContextType {
  messages: UIMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  projectId,
  initialMessages = [],
}: ChatContextProps & { children: ReactNode }) {
  const { fileSystem, handleToolCall } = useFileSystem();
  const [input, setInput] = useState("");
  const processedToolCallIds = useRef(new Set<string>());

  const { messages, sendMessage, status } = useAIChat({
    api: "/api/chat",
    messages: initialMessages,
  } as any);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || status === "submitted" || status === "streaming") return;
      sendMessage(
        { text: input },
        { body: { files: fileSystem.serialize(), projectId } }
      );
      setInput("");
    },
    [input, sendMessage, fileSystem, projectId, status]
  );

  // In AI SDK v5, tool calls run server-side and appear as parts in messages.
  // Watch for completed tool call parts and sync them to the client file system.
  useEffect(() => {
    messages.forEach((message) => {
      if (message.role !== "assistant") return;
      const parts = (message as any).parts;
      if (!Array.isArray(parts)) return;

      parts.forEach((part: any) => {
        if (part.state !== "output-available") return;
        const toolCallId: string = part.toolCallId;
        if (!toolCallId || processedToolCallIds.current.has(toolCallId)) return;

        let toolName: string | undefined;
        if (typeof part.type === "string" && part.type.startsWith("tool-")) {
          toolName = part.type.slice("tool-".length);
        } else if (part.type === "dynamic-tool") {
          toolName = part.toolName;
        }
        if (!toolName) return;

        processedToolCallIds.current.add(toolCallId);
        handleToolCall({ toolName, args: part.input });
      });
    });
  }, [messages, handleToolCall]);

  useEffect(() => {
    if (!projectId && messages.length > 0) {
      setHasAnonWork(messages as any, fileSystem.serialize());
    }
  }, [messages, fileSystem, projectId]);

  return (
    <ChatContext.Provider
      value={{
        messages: messages as UIMessage[],
        input,
        handleInputChange,
        handleSubmit,
        status,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
