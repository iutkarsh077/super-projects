import MinorEventCard from "./MinorEventCard";

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const rowClass =
  "relative mb-[13px] grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-[18px] max-[760px]:grid-cols-[24px_minmax(0,1fr)] max-[760px]:gap-x-3";

const eventIconClass =
  "h-[15px] w-[15px] fill-none stroke-current stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round] max-[760px]:h-3 max-[760px]:w-3";

function formatMonthYear(dateString) {
  if (!dateString) {
    return "";
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return monthYearFormatter.format(parsed);
}

function formatDateRange(startDate, endDate, isCurrent) {
  const start = formatMonthYear(startDate);
  const end = isCurrent ? "Present" : formatMonthYear(endDate);

  if (!start && !end) {
    return "";
  }
  if (!start) {
    return end;
  }
  if (!end) {
    return start;
  }

  return `${start} - ${end}`;
}

function toTimestamp(dateString) {
  if (!dateString) {
    return 0;
  }

  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeMinorItems(minorEvents = {}) {
  const githubProjects = (minorEvents.githubProjects || []).map((project, index) => ({
    id: `gh-${index}-${project.name || "project"}`,
    type: "project",
    title: project.name || "Untitled project",
    meta: project.updatedAt ? `Updated ${formatMonthYear(project.updatedAt)}` : "GitHub project",
    tags: [project.language, ...(project.techTags || [])].filter(Boolean).slice(0, 2),
    url: project.url,
    sortDate: toTimestamp(project.updatedAt),
  }));

  const projects = (minorEvents.projects || []).map((project, index) => ({
    id: `proj-${index}-${project.name || "project"}`,
    type: "project",
    title: project.name || "Project",
    meta:
      formatDateRange(project.startDate, project.endDate, project.currentlyWorking) ||
      project.description ||
      "Project",
    tags: (project.skills || []).filter(Boolean).slice(0, 2),
    url: project.url,
    sortDate: Math.max(toTimestamp(project.endDate), toTimestamp(project.startDate)),
  }));

  const certifications = (minorEvents.certifications || []).map((certification, index) => ({
    id: `cert-${index}-${certification.title || "certification"}`,
    type: "certification",
    title: certification.title || "Certification",
    meta:
      certification.issuer ||
      (certification.issueDate ? `Issued ${formatMonthYear(certification.issueDate)}` : "Certification"),
    tags: [certification.issuer].filter(Boolean).slice(0, 2),
    url: certification.url,
    sortDate: toTimestamp(certification.issueDate),
  }));

  const researchPapers = (minorEvents.researchPapers || []).map((paper, index) => ({
    id: `pub-${index}-${paper.title || "paper"}`,
    type: "publication",
    title: paper.title || "Publication",
    meta:
      paper.publishedOn || paper.publishedDate
        ? `Published ${formatMonthYear(paper.publishedOn || paper.publishedDate)}`
        : paper.publicationType || "Publication",
    tags: [paper.domain, paper.publicationType].filter(Boolean).slice(0, 2),
    url: paper.url,
    sortDate: toTimestamp(paper.publishedOn || paper.publishedDate),
  }));

  return [...githubProjects, ...projects, ...certifications, ...researchPapers].sort(
    (a, b) => b.sortDate - a.sortDate,
  );
}

function getSkillChips(minorEvents = {}) {
  const directSkills = Array.from(new Set((minorEvents.skillsAcquired || []).filter(Boolean))).slice(0, 2);
  if (directSkills.length > 0) {
    return directSkills;
  }

  const githubLanguages = Array.from(
    new Set((minorEvents.githubProjects || []).map((project) => project.language).filter(Boolean)),
  );
  return githubLanguages.slice(0, 2);
}

function getCountChips(minorEvents = {}) {
  const projectCount = (minorEvents.projects || []).length + (minorEvents.githubProjects || []).length;
  const publicationCount = (minorEvents.researchPapers || []).length;
  const certificationCount = (minorEvents.certifications || []).length;

  const counts = [];
  if (projectCount > 0) {
    counts.push({ key: "projects", label: `${projectCount} Projects` });
  }
  if (publicationCount > 0) {
    counts.push({ key: "publications", label: `${publicationCount} Publications` });
  }
  if (certificationCount > 0) {
    counts.push({ key: "certifications", label: `${certificationCount} Certifications` });
  }

  return counts;
}

function EventIcon({ variant }) {
  if (variant === "education") {
    return (
      <svg className={eventIconClass} viewBox="0 0 20 20" aria-hidden="true">
        <path d="m3 8.2 7-3.2 7 3.2-7 3.2z" />
        <path d="M6 10.8v2.3c0 .9 1.8 1.9 4 1.9s4-1 4-1.9v-2.3" />
      </svg>
    );
  }

  if (variant === "break") {
    return (
      <svg className={eventIconClass} viewBox="0 0 20 20" aria-hidden="true">
        <path d="M6 3.8h8v2.6L11.5 9 14 11.6v2.6H6v-2.6L8.5 9 6 6.4z" />
      </svg>
    );
  }

  return (
    <svg className={eventIconClass} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="6.4" width="14" height="9.5" rx="2.1" />
      <path d="M7 6.4V4.8h6v1.6" />
      <path d="M8.2 10h3.6" />
    </svg>
  );
}

export default function MajorEventCard({ event }) {
  const {
    title,
    company,
    institution,
    category,
    startDate,
    endDate,
    minorEvents,
    currentlyWorking,
    currentlyStudying,
  } = event;

  const primaryName = company || institution || "Career Event";
  const range = formatDateRange(startDate, endDate, currentlyWorking || currentlyStudying);
  const skillChips = getSkillChips(minorEvents);
  const countChips = getCountChips(minorEvents);
  const minorItems = normalizeMinorItems(minorEvents);

  const iconVariant = category === "education" ? "education" : category === "career_break" ? "break" : "work";
  const isCompact = category === "career_break";
  const nodeTone =
    iconVariant === "education"
      ? "border-blue-200 bg-blue-50 text-blue-600"
      : iconVariant === "break"
        ? "border-slate-300 bg-slate-50 text-slate-500"
        : "border-teal-200 bg-teal-50 text-teal-600";

  return (
    <div className={rowClass}>
      <div
        className={`relative z-10 grid h-8 w-8 place-items-center rounded-[10px] border-[1.4px] ${nodeTone} max-[760px]:h-6 max-[760px]:w-6 max-[760px]:rounded-lg`}
      >
        <EventIcon variant={iconVariant} />
      </div>

      <div className="min-w-0">
        <article
          className={`rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_1px_0_rgba(17,24,39,0.04)] ${
            isCompact ? "max-w-[430px]" : ""
          }`}
        >
          <header className="flex items-baseline justify-between gap-2.5">
            <p className="m-0 text-[12px] text-slate-500">{primaryName}</p>
            <p className="m-0 text-[12px] whitespace-nowrap text-slate-500 max-[760px]:text-right max-[760px]:whitespace-normal">
              {range || "Date unavailable"}
            </p>
          </header>

          <h3 className="m-0 mt-0.5 mb-2.5 text-[30px] leading-[1.08] font-bold tracking-[-0.03em] text-slate-900 max-[760px]:text-[23px]">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            {skillChips.map((skill) => (
              <span
                key={skill}
                className="inline-flex min-h-6 items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[12px] leading-none text-slate-600"
              >
                {skill}
              </span>
            ))}

            {countChips.map((item) => (
              <span
                key={item.key}
                className="inline-flex min-h-6 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] leading-none text-slate-500"
              >
                <span className="h-2 w-2 rounded-full border border-slate-400" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
        </article>

        {minorItems.length > 0 && (
          <details className="group ml-7 mt-3 max-[760px]:ml-3">
            <summary className="flex h-7 list-none cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-100/90 px-3 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-200/70 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show {minorItems.length} minor events</span>
              <span className="hidden group-open:inline">Hide {minorItems.length} minor events</span>
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="ml-auto h-3.5 w-3.5 fill-none stroke-current stroke-[1.8] transition-transform [stroke-linecap:round] [stroke-linejoin:round] group-open:rotate-180"
              >
                <path d="m6 8 4 4 4-4" />
              </svg>
            </summary>

            <div className="relative mt-2 flex flex-col gap-2 border-l border-dashed border-slate-300 pl-5 max-[760px]:pl-4">
              {minorItems.map((item) => (
                <MinorEventCard key={item.id} item={item} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
