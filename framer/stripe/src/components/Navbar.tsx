import { ChevronRight } from "lucide-react";

const Navbar = () => {
  return (
    <div className="w-full h-16 bg-red-900 z-50 flex justify-center mt-6 absolute">
      <div className="w-[80%] bg-white h-full flex justify-between items-center">
        <div className="flex items-center gap-x-8">
          <div className="lowercase transition-all ease-in-out duration-300 hover:text-gray-500 text-black text-[26px] tracking-tighter  font-bold scale-y-115 hover:cursor-pointer">Stripe</div>
          <div className="flex items-center gap-x-7">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
        </div>

        <div>
          <button>Sign in</button>
          <button className=""><span>Contact sales</span> <ChevronRight /></button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
