import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import { useRef } from "react";
const constantFolders = [
  {
    title: "Superman",
    description:
      "Superman is one of the strongest superheroes, known for his super strength, flight, heat vision, and unwavering sense of justice.",
    image: "first.png",
  },
  {
    title: "Batman",
    description:
      "Batman is a brilliant detective and martial artist who protects Gotham City using advanced technology, strategy, and fearless determination.",
    image: "second.png",
  },
  {
    title: "Spider-Man",
    description:
      "Spider-Man is a young hero with spider-like abilities such as wall-climbing, web-shooting, and incredible agility, fighting crime in New York City.",
    image: "third.png",
  },
];

const CustomHooks = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const motionScrollY = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const opacityonScrollY = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const blurScrolly = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 10, 0])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log(latest);
  });

  return (
    <div
      ref={ref}
      className="flex  justify-center items-center  bg-black text-white h-[300vh] w-full"
    >
      <div>
        <div className="flex flex-col gap-y-60">
        {constantFolders.map((item, index) => (
          <motion.div
            key={index}
            style={{ y: index % 2 === 0 ? motionScrollY : motionScrollY * -1, opacity: opacityonScrollY }}
            className="flex justify-between items-center w-[900px]"
          >
            <motion.div style={{filter: useMotionTemplate`blur(${blurScrolly}px)`}} className="w-[40%] flex flex-col gap-y-5">
              <div className="font-semibold text-4xl">{item.title}</div>
              <div className="font-normal text-gray-500">{item.description}</div>
            </motion.div>

            <img
              src={item.image}
              alt={item.title}
              className="w-auto h-60 object-cover"
            />
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default CustomHooks;