export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold">API Docs</h1>
      <p className="mt-4 text-sm text-gray-400">
        StackLens API documentation will be available here.
      </p>
      <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
        <p>
          Use <code className="rounded bg-black/30 px-2 py-1">POST /analyze</code> on the
          gateway service to run a full scan.
        </p>
      </div>
    </main>
  );
}