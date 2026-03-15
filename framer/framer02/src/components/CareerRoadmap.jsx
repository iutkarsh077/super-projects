import React from "react";

const roadmap = [
  {
    title: "Web Development Basics",
    description: "HTML • CSS • JavaScript",
  },
  {
    title: "Freelance Web Developer",
    description: "Client projects • Responsive UI • Real-world experience",
  },
  {
    title: "Full-stack Developer Intern",
    description: "AIRTH • Feb 2025 – Mar 2025",
  },
  {
    title: "Software Developer Intern",
    description: "StamperHR • Feb 2025 – May 2025",
  },
  {
    title: "Software Engineer Intern",
    description: "ThinkAct AI • May 2025 – Oct 2025",
  },
  {
    title: "Future Goal",
    description: "Full-time Software Engineer",
  },
];

const CareerRoadmap = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="relative w-[500px]">

        <div className="absolute left-4 top-0 h-full w-1 bg-blue-500"></div>

        {roadmap.map((item, index) => (
          <div key={index} className="flex items-start gap-6 mb-10 relative">

            <div className="w-8 h-8 rounded-full bg-blue-500 z-10"></div>

            <div className="bg-white shadow-md rounded-xl p-4 w-full">
              <h2 className="font-bold text-lg">{item.title}</h2>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerRoadmap;