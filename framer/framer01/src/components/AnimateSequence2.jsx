import { Check } from "lucide-react";
import { motion, useAnimate } from "motion/react";
import React from "react";

const AnimateSequence2 = () => {
  const [scope, animate] = useAnimate();
  const handleClick = async () => {
    (animate(
      "span",
      {
        opacity: 0,
      },
      {
        duration: 0,
        ease: "easeInOut",
      },
    ),
      await animate(
        "button",
        {
          width: "0px",
          opacity: 0,
        },
        {
          duration: 0.7,
          ease: "easeInOut",
        },
      ),
      await animate(
        "#circle",
        {
          opacity: 1,
          scale: [1, 1.2, 0.8, 1],
        },
        {
          duration: 0.9,
          ease: "easeInOut",
        },
      ),
      await animate(
        "#tick",
        {
          opacity: 1,
          scale: [1, 1.2, 0.8, 1],
        },
        {
          duration: 0.9,
          ease: "easeInOut",
        },
      ));
  };
  return (
    <>
      <div
        ref={scope}
        className="bg-black text-white flex h-screen w-full justify-center items-center"
      >
        <motion.button
          onClick={handleClick}
          className="w-80 h-14 rounded-lg text-[18px] hover:cursor-pointer font-medium bg-linear-to-r from-cyan-500 to-blue-500"
        >
          <span>$ 231 Pay here</span>
        </motion.button>

        <motion.div className="relative">
          <motion.div
            id="circle"
            initial={{
              opacity: 0,
            }}
            className="h-20  w-20 rounded-full bg-linear-to-r from-green-200 via-green-400 to-green-900 "
          />
          <motion.div
            id="tick"
            initial={{
                opacity: 0
            }}
            className="absolute top-1/3 left-1/3 shadow-2xl shadow-green-500"
          >
            {" "}
            <Check className="text-white" />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default AnimateSequence2;
