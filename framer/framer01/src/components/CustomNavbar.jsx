import { motion } from "motion/react";
import { useState } from "react";

const CustomNavbar = () => {
  const items = ["Home", "About", "Contact", "Info"];
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-[40%] rounded-2xl h-20 bg-gray-200">
        <div className="flex justify-between items-center h-full px-9 py-2 ">
          {items.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className="relative h-full w-full flex items-center justify-center text-xl font-semibold cursor-pointer"
            >
              {hovered === index && (
                <motion.div
                  layoutId="hover"
                  className="absolute inset-0 bg-black rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              <span className="relative z-10 text-gray-600 hover:text-white">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomNavbar;