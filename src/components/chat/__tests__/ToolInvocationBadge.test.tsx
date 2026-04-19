import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => cleanup());

function makeInvocation(toolName: string, args: any, state: "call" | "result" = "call", result?: any) {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result: result ?? { success: true } };
  }
  return { toolCallId: "1", toolName, args, state };
}

test("shows 'Creating file' for str_replace_editor create", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.jsx" })} />);
  expect(screen.getByText("Creating file: App.jsx")).toBeDefined();
});

test("shows 'Editing file' for str_replace_editor str_replace", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/Counter.jsx" })} />);
  expect(screen.getByText("Editing file: Counter.jsx")).toBeDefined();
});

test("shows 'Editing file' for str_replace_editor insert", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "src/Counter.jsx" })} />);
  expect(screen.getByText("Editing file: Counter.jsx")).toBeDefined();
});

test("shows 'Reading file' for str_replace_editor view", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "src/index.ts" })} />);
  expect(screen.getByText("Reading file: index.ts")).toBeDefined();
});

test("shows 'Undoing edit' for str_replace_editor undo_edit", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" })} />);
  expect(screen.getByText("Undoing edit: App.tsx")).toBeDefined();
});

test("shows 'Deleting file' for file_manager delete", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "src/old.jsx" })} />);
  expect(screen.getByText("Deleting file: old.jsx")).toBeDefined();
});

test("shows 'Renaming' for file_manager rename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "src/foo.jsx" })} />);
  expect(screen.getByText("Renaming: foo.jsx")).toBeDefined();
});

test("falls back to raw toolName for unknown tool", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("unknown_tool", {})} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("renders green dot when state is result", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "App.jsx" }, "result")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("renders spinner when state is call", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "App.jsx" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
