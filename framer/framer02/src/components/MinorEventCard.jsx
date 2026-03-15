function MinorTypeIcon({ type }) {
  if (type === "publication") {
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-full w-full fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
      >
        <path d="M5 4.5h10v11H5z" />
        <path d="M7.2 8h5.6M7.2 10.6h5.6M7.2 13.2h3.4" />
      </svg>
    );
  }

  if (type === "certification") {
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-full w-full fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
      >
        <circle cx="10" cy="8" r="3.3" />
        <path d="M8.2 10.8 7 16l3-1.9L13 16l-1.2-5.2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-full w-full fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
    >
      <rect x="4" y="5.8" width="12" height="9.2" rx="2" />
      <path d="M7 5.8V4.4h6v1.4" />
    </svg>
  );
}

function getTone(type) {
  if (type === "publication") {
    return "bg-violet-100 text-violet-600";
  }

  if (type === "certification") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-sky-100 text-sky-700";
}

export default function MinorEventCard({ item }) {
  const tags = (item.tags || []).filter(Boolean).slice(0, 2);
  const tone = getTone(item.type);

  return (
    <div className="relative pl-5 before:absolute before:-left-[21px] before:top-5 before:w-4 before:border-t before:border-dashed before:border-slate-300 after:absolute after:-left-[24px] after:top-[17px] after:h-1.5 after:w-1.5 after:rounded-full after:bg-slate-400">
      <article className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
        <header className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tone}`}
            aria-hidden="true"
          >
            <span className="h-3.5 w-3.5">
              <MinorTypeIcon type={item.type} />
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-[14px] leading-[1.2] font-semibold text-slate-900">{item.title}</p>
            <p className="m-0 text-[11px] text-slate-500">{item.meta}</p>
          </div>

          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label={`Open ${item.title}`}
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-3 w-3 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="M6 14 14 6M8 6h6v6" />
              </svg>
            </a>
          ) : null}
        </header>

        {tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={`${item.id}-${tag}`}
                className="inline-flex h-5 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
