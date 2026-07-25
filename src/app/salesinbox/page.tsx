export default function SalesInboxPage() {
  const threads = [
    { from: "kris@king.com", subject: "Re: Pricing for Enterprise", preview: "Thanks for the quote, can we discuss volume…", time: "2h ago" },
    { from: "pepper@acme.example", subject: "Contract review", preview: "Legal finished reviewing the MSA…", time: "Yesterday" },
    { from: "sam@greenleaf.co", subject: "Demo follow-up", preview: "Great session — sending requirements…", time: "2d ago" },
  ];
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold">SalesInbox</h1>
      <div className="overflow-hidden rounded border border-[var(--crm-border)] bg-white">
        {threads.map((t) => (
          <div key={t.subject} className="flex cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 hover:bg-blue-50/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {t.from[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <span className="truncate text-sm font-medium">{t.from}</span>
                <span className="shrink-0 text-[11px] text-gray-400">{t.time}</span>
              </div>
              <div className="truncate text-sm text-[var(--crm-blue)]">{t.subject}</div>
              <div className="truncate text-xs text-gray-500">{t.preview}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">Demo inbox UI — wire IMAP/Gmail later via Supabase Edge Functions.</p>
    </div>
  );
}
