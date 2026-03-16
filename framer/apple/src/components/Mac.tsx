import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
const Mac = () => {
  return (
    <motion.section
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.8,
        delay: 0.4,
      }}
      className="w-full pt-10"
    >
      <div className="px-4 py-3 max-w-8xl text-center text-xs text-gray-700 sm:text-sm">
        Get up to 6 months of No Cost EMI* plus up to Rs. 10000 instant cashback
        on selected products with eligible cards.{" "}
        <a
          href="#"
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
        >
          Shop <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      <div className="bg-[#f5f5f7] px-4 pb-12 pt-14 sm:pb-16 sm:pt-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-6xl">
            MacBook Air
          </h1>
          <p className="mt-3 text-xl font-medium text-neutral-800 sm:text-3xl">
            Amazing Mac. Surprising price.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <button className="rounded-full bg-blue-600 px-6 py-2 text-base font-medium text-white hover:bg-blue-700">
              Learn more
            </button>
            <button className="rounded-full border border-blue-600 px-7 py-2 text-base font-medium text-blue-600 hover:bg-blue-50">
              Buy
            </button>
          </div>

          <div className=" w-full h-96 overflow-hidden flex justify-center items-start">
            <img
              src="/apple_assets/mac.png"
              alt="MacBook Air hero image"
              className="scale-[2.5]"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Mac;
