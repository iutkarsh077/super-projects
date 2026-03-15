import Roadmap from "./components/Roadmap3";
import data from "./components/data";



export default function App() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9fafa] to-[#f3f4f6] p-2.5 min-[1180px]:p-[14px]">
      <section className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-4 min-[760px]:px-[26px] min-[760px]:pb-[30px] min-[760px]:pt-[18px]">
        <Roadmap timeline={data.timeline} />
      </section>
    </div>
  );
}
