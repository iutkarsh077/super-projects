import { Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const cards = [
  {
    description: "Lana Del Rey",
    title: "Summertime Sadness",
    src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p className="text-[10px] text-neutral-500">
          Lana Del Rey, an iconic American singer-songwriter, is celebrated for
          her melancholic and cinematic music style. Born Elizabeth Woolridge
          Grant in New York City, she has captivated audiences worldwide with
          her haunting voice and introspective lyrics. <br /> <br />
          Her songs often explore themes of tragic romance, glamour, and
          nostalgia, blending modern pop with vintage aesthetics. Lana Del Rey
          has built a unique artistic identity and continues to influence the
          global music scene.
        </p>
      );
    },
  },
  {
    description: "The Weeknd",
    title: "Blinding Lights",
    src: "second.png",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p className="text-[10px] text-neutral-500">
          The Weeknd is a globally recognized Canadian artist known for his
          distinctive voice and atmospheric production. His music blends R&B,
          pop, and electronic elements to create a modern and immersive sound.
          <br /> <br />
          Songs like "Blinding Lights" showcase his ability to mix nostalgic
          synthwave vibes with contemporary pop, making him one of the most
          influential artists of this generation.
        </p>
      );
    },
  },
  {
    description: "Taylor Swift",
    title: "Midnight Rain",
    src: "third.png",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p className="text-[10px] text-neutral-500">
          Taylor Swift is one of the most successful singer-songwriters of the
          modern era. Known for her storytelling ability, she has evolved from
          country roots to global pop dominance. <br /> <br />
          Her albums often reflect personal experiences, emotions, and cultural
          moments, resonating deeply with millions of listeners around the
          world.
        </p>
      );
    },
  },
];

const LayoutCards = ({ card, setCurrent }) => {
  return (
    <motion.div layoutId={`layout-${card.title}`} className="h-40 w-full py-3">
      <div className="flex justify-between items-center p-4 bg-gray-200 rounded-2xl">
        <div className="flex gap-x-4 items-center">
          <motion.img layoutId={`image-${card.title}`} src={card.src} className="w-16 h-16 object-cover rounded-lg" />

          <div>
            <motion.div layoutId={`layout-${card.description}`} className="font-semibold">{card.title}</motion.div>
            <div className="text-gray-600">{card.description}</div>
          </div>
        </div>

        <motion.div
        layoutId={`layout-${card.ctaLink}`}
          className="bg-green-400 cursor-pointer text-black p-2 rounded-xl flex gap-2"
          onClick={() => setCurrent(card)}
        >
          <Play size={16} />
          <span>Play</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

const CustomLayout = () => {
  const [current, setCurrent] = useState(null);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <AnimatePresence>
        {current && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

            <motion.div
                  layoutId={`layout-${current.title}`}
            //   initial={{
            //     opacity: 0,
            //     scale: 0,
            //   }}
            //   animate={{
            //     opacity: 1,
            //     scale: 1.5,
            //   }}
            //   transition={{
            //     duration: 0.2,
            //   }}
            //   exit={{
            //     opacity: 0,
            //     scale: 0,
            //   }}
              className="fixed z-50 bg-white w-[400px] rounded-2xl left-1/2 top-1/4 -translate-x-1/2 p-5"
            >
              <div className="relative">
                <motion.img
                layoutId={`image-${current.title}`}
                  src={current.src}
                  className="w-full h-48 object-cover rounded-xl"
                />

                <X
                  onClick={() => setCurrent(null)}
                  className="absolute top-2 right-2 cursor-pointer"
                />
              </div>

              <motion.h2 layoutId={`layout-${current.description}`} className="font-bold mt-4">{current.title}</motion.h2>

              {current.content()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="w-[40%] h-[60%] border rounded-2xl">
        {cards.map((item, index) => (
          <motion.div key={index}>
            <LayoutCards card={item} setCurrent={setCurrent} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CustomLayout;
