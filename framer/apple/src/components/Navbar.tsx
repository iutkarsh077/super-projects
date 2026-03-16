import { Search, ShoppingBag } from "lucide-react";
import { NavbarItems } from "../constants";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const Navbar = () => {
  const [isActive, setActive] = useState<number | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (index: number) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActive(index);
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setActive(null), 100);
  };

  return (
    <motion.div initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.4
    }} className="fixed w-full font-apple z-50">
      <motion.div className="w-full h-10 bg-white/80 backdrop-blur-md flex justify-center ml-28">
        <div className="w-full max-w-6xl flex items-center justify-center gap-x-9 h-full ">
          <img
            src="/apple_assets/apple_logo.png"
            alt="logo"
            className="w-5 brightness-0 h-auto hover:cursor-pointer"
          />

          <div className="flex items-center gap-x-9 text-xs font-medium text-gray-700 flex-1">
            {NavbarItems.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => handleEnter(index)}
                onMouseLeave={handleLeave}
                className="hover:cursor-pointer h-10 flex items-center"
              >
                {item.name}
              </div>
            ))}
          <Search className="w-4 text-gray-700 hover:cursor-pointer" />
          <ShoppingBag className="w-4 text-gray-700 hover:cursor-pointer" />
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {isActive !== null && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 top-10 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
            />
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              onMouseEnter={() => handleEnter(isActive)}
              onMouseLeave={handleLeave}
              className="absolute top-10 z-50 bg-[#f5f5f7]/95 backdrop-blur-md w-full flex justify-center shadow-sm  min-h-100  items-center"
            >
              <div className="max-w-5xl w-full flex gap-x-28 items-start py-16 px-6">
                {NavbarItems[isActive].subCategory.map((item) => (
                  <div key={item.id} className="flex flex-col gap-y-4">
                    <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                      {item.name}
                    </div>
                    <div className="flex flex-col gap-y-3">
                      {item.names.map((product, i) => (
                        <div
                          key={i}
                          className={`text-gray-900 hover:text-blue-600 cursor-pointer transition-colors  ${item.id === 1 ? "text-2xl font-medium" : "text-[12px] font-medium "}`}
                        >
                          {product}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
