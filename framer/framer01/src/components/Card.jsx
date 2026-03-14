import { Cog, Settings, WifiCog } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const Card = () => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex justify-center items-center h-screen w-full bg-gray-200">
      <div onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} className="h-140 w-110 rounded-xl bg-white  shadow-sm shadow-gray-300 border border-gray-200 px-6 pt-6 flex flex-col gap-y-10">
        <div className="flex flex-col gap-y-3">
          <div className="text-black font-medium text-lg">
            Organization UI Components
          </div>
          <div className="text-gray-600 tracking-wide text-sm">
            Clerk's UI components add turn-key simplicity to complex
            Organization management tasks.
          </div>
        </div>
        <AnimatePresence>
        {show && (
            <motion.div
              initial={{
                opacity: 0,
                filter: "blur(10px)",
                scale: 0.98,
                y: -20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 100,
                filter: "blur(10px)",
                scale: 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="bg-gray-100 max-h-fit"
            >
              <motion.div className="shadow-md h-full shadow-gray-300 p-2 flex rounded-md flex-col gap-y-5 flex-1 mb-10">
                {new Array(5).fill(0).map((item, index) => (
                  <div
                    key={index}
                    className="max-h-fit flex justify-between gap-x-5"
                  >
                    <div className="flex gap-x-5">
                      <div className="bg-white p-3 rounded-xl text-center shadow-sm shadow-gray-400">
                        <Cog className="h-auto w-auto" />
                      </div>
                      <div>
                        <p className="text-black font-medium text-lg">
                          Bluth Connect
                        </p>
                        <p className="text-gray-600 tracking-wide text-sm">
                          Mr. Manager
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 text-center rounded-xl shadow-sm shadow-gray-400">
                      <WifiCog className="h-auto w-auto " />
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Card;
