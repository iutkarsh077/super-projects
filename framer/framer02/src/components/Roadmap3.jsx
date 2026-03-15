import MajorEventCard from "./MajorEventCard";
import TransitionEvent from "./TransitionEvent";

const rowClass =
  "relative mb-[13px] grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-[18px] max-[760px]:grid-cols-[24px_minmax(0,1fr)] max-[760px]:gap-x-3";

export default function Roadmap({ timeline = [] }) {
  const orderedTimeline = [...timeline].reverse();
  const currentEvent = orderedTimeline.find((event) => event.type === "major_event");
  const likelyTrack = currentEvent?.title
    ? `${currentEvent.title} -> Tech Lead -> Principal`
    : "Engineering Lead -> VP Engineering -> CTO";

  return (
    <section className="mx-auto w-full max-w-[760px]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="cursor-pointer border-0 border-b-2 border-slate-800 bg-transparent px-3 py-2 text-[13px] font-semibold text-slate-900"
        >
          Career Map
        </button>

        <button
          type="button"
          className="inline-flex h-[35px] items-center gap-2 rounded-xl border border-teal-500 bg-white px-3.5 text-[13px] font-semibold text-slate-800"
        >
          Compare Profile
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-3 w-3 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M6 14 14 6M8 6h6v6" />
          </svg>
        </button>
      </div>

      <div className="relative pb-3 before:absolute before:bottom-2.5 before:left-[15px] before:top-2 before:border-l-2 before:border-dotted before:border-slate-300 max-[760px]:before:left-[11px]">
        <div className={`${rowClass} mb-[18px]`}>
          <div className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-[12px] leading-none font-bold text-slate-400 max-[760px]:h-6 max-[760px]:w-6 max-[760px]:text-[10px]">
            ?
          </div>

          <div className="rounded-[14px] border border-dashed border-slate-300 bg-white/80 px-3.5 py-3">
            <p className="m-0 text-[22px] leading-[1.2] text-slate-400 max-[760px]:text-[18px]">What&apos;s Next?</p>
            <p className="m-0 mt-1 text-[17px] leading-[1.4] text-slate-400 max-[760px]:text-[14px]">
              {likelyTrack}
            </p>
          </div>
        </div>

        {orderedTimeline.map((event) => {
          if (event.type === "major_event") {
            return <MajorEventCard key={event.id} event={event} />;
          }

          if (event.type === "transition_event") {
            return <TransitionEvent key={event.id} event={event} />;
          }

          return null;
        })}
      </div>
    </section>
  );
}
