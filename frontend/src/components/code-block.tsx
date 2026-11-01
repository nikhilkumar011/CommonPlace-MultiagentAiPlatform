"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { BeforeMount } from "@monaco-editor/react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-24 items-center px-4 font-mono text-xs text-[#777]">
      Loading editor…
    </div>
  ),
});

const languageAliases: Record<string, string> = {
  bash: "shell",
  csharp: "csharp",
  cs: "csharp",
  htm: "html",
  js: "javascript",
  jsx: "javascript",
  md: "markdown",
  py: "python",
  sh: "shell",
  ts: "typescript",
  tsx: "typescript",
  txt: "plaintext",
  yml: "yaml",
};

const supportedLanguages = new Set([
  "c",
  "c++",
  "csharp",
  "css",
  "dart",
  "dockerfile",
  "go",
  "graphql",
  "html",
  "java",
  "javascript",
  "json",
  "kotlin",
  "less",
  "lua",
  "markdown",
  "objective-c",
  "perl",
  "php",
  "plaintext",
  "powershell",
  "python",
  "r",
  "ruby",
  "rust",
  "scss",
  "shell",
  "sql",
  "swift",
  "typescript",
  "xml",
  "yaml",
]);

const defineEditorTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("commonplace-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "737373", fontStyle: "italic" },
      { token: "keyword", foreground: "C792EA" },
      { token: "string", foreground: "C3E88D" },
      { token: "number", foreground: "F78C6C" },
    ],
    colors: {
      "editor.background": "#101010",
      "editor.foreground": "#D4D4D4",
      "editorLineNumber.foreground": "#555555",
      "editorLineNumber.activeForeground": "#A0A0A0",
      "editor.selectionBackground": "#333333",
      "editor.lineHighlightBackground": "#151515",
      "editorGutter.background": "#101010",
      "editorWidget.background": "#171717",
      "scrollbarSlider.background": "#45454566",
      "scrollbarSlider.hoverBackground": "#66666688",
      "scrollbarSlider.activeBackground": "#77777799",
    },
  });
};

function getLanguage(language: string): string {
  const normalized = language.toLowerCase();
  const alias = languageAliases[normalized] ?? normalized;
  return supportedLanguages.has(alias) ? alias : "plaintext";
}

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const resolvedLanguage = getLanguage(language ?? "");
  const lineCount = Math.max(1, code.split("\n").length);
  const editorHeight = Math.min(480, Math.max(64, lineCount * 21 + 24));

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1_500);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2_500);
    }
  }

  return (
    <section className="my-4 overflow-hidden border border-[#303030] bg-[#101010]">
      <header className="flex h-9 items-center justify-between border-b border-[#292929] bg-[#141414] px-3">
        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#858585]">
          {resolvedLanguage}
        </span>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#858585] transition-colors hover:text-white"
          aria-label="Copy code"
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy"}
        </button>
      </header>
      <div className="overflow-hidden py-1">
        <MonacoEditor
          height={editorHeight}
          language={resolvedLanguage}
          value={code}
          theme="commonplace-dark"
          beforeMount={defineEditorTheme}
          loading={
            <div
              className="flex items-center px-4 font-mono text-xs text-[#777]"
              style={{ height: editorHeight }}
            >
              Loading editor…
            </div>
          }
          options={{
            ariaLabel: `${resolvedLanguage} code`,
            automaticLayout: true,
            contextmenu: true,
            domReadOnly: true,
            fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace",
            fontLigatures: false,
            fontSize: 12,
            lineHeight: 21,
            lineNumbers: "on",
            minimap: { enabled: false },
            overviewRulerLanes: 0,
            padding: { top: 8, bottom: 8 },
            readOnly: true,
            renderLineHighlight: "none",
            scrollBeyondLastLine: false,
            scrollbar: {
              horizontal: "auto",
              vertical: "auto",
              verticalScrollbarSize: 7,
              horizontalScrollbarSize: 7,
            },
            wordWrap: "on",
          }}
        />
      </div>
    </section>
  );
}
