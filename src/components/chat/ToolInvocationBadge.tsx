"use client";

import { Loader2 } from "lucide-react";
import { ToolInvocation } from "ai";

function getLabel(toolName: string, args: any): string {
  const filename = args?.path?.split("/").pop() ?? args?.path ?? "";

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":     return `Creating file: ${filename}`;
      case "str_replace":
      case "insert":     return `Editing file: ${filename}`;
      case "view":       return `Reading file: ${filename}`;
      case "undo_edit":  return `Undoing edit: ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename": return `Renaming: ${filename}`;
      case "delete": return `Deleting file: ${filename}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  const { toolName, args, state } = toolInvocation;
  const label = getLabel(toolName, args);
  const isDone = state === "result" && (toolInvocation as any).result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
