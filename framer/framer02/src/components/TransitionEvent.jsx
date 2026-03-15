const transitionLabels = {
  promotion: "Promotion",
  career_transition: "Career Switch",
  career_start: "Job Switch",
  career_break: "Career Break",
};

const rowClass =
  "relative mt-1 mb-3 grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-[18px] max-[760px]:grid-cols-[24px_minmax(0,1fr)] max-[760px]:gap-x-3";

function toTransitionLabel(event) {
  const byCategory = transitionLabels[event.category];
  if (byCategory) {
    return byCategory;
  }

  if (!event.title) {
    return "Transition";
  }

  if (event.title.length <= 30) {
    return event.title;
  }

  return `${event.title.slice(0, 27)}...`;
}

export default function TransitionEvent({ event }) {
  return (
    <div className={rowClass}>
      <div className="flex justify-center pt-3">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      </div>

      <div className="flex min-h-[29px] items-center gap-[9px]">
        <span className="h-0.5 w-[30px] rounded-full bg-slate-300" />
        <span className="inline-flex h-6 items-center rounded-lg border border-slate-300 bg-slate-200 px-2.5 text-[12px] font-semibold whitespace-nowrap text-slate-600">
          {toTransitionLabel(event)}
        </span>
      </div>
    </div>
  );
}
