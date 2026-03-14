import { motion, stagger, useAnimate } from "motion/react";
import { useEffect } from "react";
const text =
  "The rapid growth of technology has transformed the way people communicate, work, and learn in the modern world. From smartphones and cloud computing to artificial intelligence and automation, digital innovation continues to reshape industries and everyday life. While these advancements have created countless opportunities for efficiency and creativity, they have also introduced new challenges related to privacy, security, and digital well-being. As society moves forward, finding a balance between technological progress and responsible usage will remain essential for building a sustainable and connected future.";

const AnimateSequence = () => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
      },
      {
        duration: 1,
        ease: "easeInOut",
        delay: stagger(0.02),
      },
    );
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <div
        ref={scope}
        className="w-[70%] h-auto font-bold text-3xl flex gap-x-2 flex-wrap leading-13"
      >
        {text.split(" ").map((item, index) => (
          <motion.span  initial={{
              opacity: 0,
              filter: "blur(10px)",
              y: 20
            }} key={index}>{item}</motion.span>
        ))}
      </div>
    </div>
  );
};

export default AnimateSequence;
