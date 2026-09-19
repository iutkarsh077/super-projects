"use client";

import { KeyboardEvent, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Phase = "idle" | "planning" | "coding" | "done" | "error";

type BuildPlanResponse = {
  build_id: string;
  plan: string;
};

type BuildImplementResponse = {
  build_id: string;
  message: string;
  preview_url: string | null;
  files: string[];
};

const EXAMPLE_PROMPT =
  "Build a markdown editor with HTML, CSS, and JavaScript. Live preview with marked.js, formatting toolbar, word count, download .md, localStorage autosave, and a clean responsive UI.";

const AppBuilder = () => {
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const previewSrc = useMemo(() => {
    if (!previewPath) return null;
    return `${API_BASE}${previewPath}`;
  }, [previewPath]);

  const busy = phase === "planning" || phase === "coding";

  const handleBuild = async (): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed || busy) return;

    setError(null);
    setPlan(null);
    setSummary(null);
    setPreviewPath(null);
    setFiles([]);
    setPhase("planning");

    try {
      const planRes = await fetch(`${API_BASE}/api/build/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!planRes.ok) {
        const detail = await planRes.text();
        throw new Error(detail || "Planning failed");
      }

      const planData: BuildPlanResponse = await planRes.json();
      setPlan(planData.plan);
      setPhase("coding");

      const codeRes = await fetch(`${API_BASE}/api/build/implement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          build_id: planData.build_id,
          query: trimmed,
          plan: planData.plan,
        }),
      });

      if (!codeRes.ok) {
        const detail = await codeRes.text();
        throw new Error(detail || "Implementation failed");
      }

      const codeData: BuildImplementResponse = await codeRes.json();
      setSummary(codeData.message);
      setPreviewPath(codeData.preview_url);
      setFiles(codeData.files);
      setPhase("done");

      if (!codeData.preview_url) {
        setError(
          "Build finished but no index.html was found. Check generated files in the sidebar."
        );
      }
    } catch (err) {
      console.error(err);
      setPhase("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleBuild();
    }
  };

  return (
    <div className="flex h-screen bg-[#0c0c0f] text-zinc-100">
      <aside className="flex w-[420px] shrink-0 flex-col border-r border-zinc-800">
        <div className="border-b border-zinc-800 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
            Codin Agent
          </p>
          <h1 className="mt-1 text-lg font-semibold">Plan → Build → Preview</h1>
          <p className="mt-1 text-sm text-zinc-400">
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {query.trim() && (
            <div className="rounded-xl bg-violet-600/20 px-4 py-3 text-sm text-violet-100 ring-1 ring-violet-500/30">
              {query.trim()}
            </div>
          )}

          {phase !== "idle" && (
            <div className="space-y-2 text-sm">
              <StatusRow
                label="Planning"
                active={phase === "planning"}
                done={phase === "coding" || phase === "done"}
              />
              <StatusRow
                label="Writing code"
                active={phase === "coding"}
                done={phase === "done"}
              />
              <StatusRow
                label="Live preview"
                active={false}
                done={phase === "done" && !!previewPath}
              />
            </div>
          )}

          {plan && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/60">
              <h2 className="border-b border-zinc-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Plan
              </h2>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap p-4 text-xs leading-relaxed text-zinc-300">
                {plan}
              </pre>
            </section>
          )}

          {summary && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/60">
              <h2 className="border-b border-zinc-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Summary
              </h2>
              <p className="whitespace-pre-wrap p-4 text-sm text-zinc-300">
                {summary}
              </p>
            </section>
          )}

          {files.length > 0 && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/60">
              <h2 className="border-b border-zinc-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Generated files ({files.length})
              </h2>
              <ul className="max-h-40 overflow-auto p-3 font-mono text-xs text-zinc-400">
                {files.map((file) => (
                  <li key={file} className="truncate py-0.5">
                    {file}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-zinc-800 p-4">
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the app you want..."
              rows={3}
              disabled={busy}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-500 disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={() => setQuery(EXAMPLE_PROMPT)}
                disabled={busy}
                className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
              >
                Use example
              </button>
              <button
                type="button"
                onClick={() => void handleBuild()}
                disabled={!query.trim() || busy}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Building…" : "Build app"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2">
          <span className="text-sm font-medium text-zinc-700">Preview</span>
          {previewSrc ? (
            <a
              href={previewSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-600 hover:underline"
            >
              Open in new tab
            </a>
          ) : (
            <span className="text-xs text-zinc-400">
              {busy ? "Generating…" : "Waiting for a build"}
            </span>
          )}
        </div>

        <div className="relative flex-1">
          {previewSrc ? (
            <iframe
              title="Generated app preview"
              src={previewSrc}
              className="absolute inset-0 h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-zinc-500">
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-8 py-10 shadow-sm">
                <p className="text-sm font-medium text-zinc-700">
                  Your app preview will appear here
                </p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Like Lovable: chat on the left, running UI on the right.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function StatusRow({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          done ? "bg-emerald-500" : active ? "bg-violet-500 animate-pulse" : "bg-zinc-700"
        }`}
      />
      <span className={done ? "text-zinc-300" : active ? "text-white" : "text-zinc-500"}>
        {label}
      </span>
    </div>
  );
}

export default AppBuilder;
