import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { flashCardQuestions } from "../utils/constant";
const FlashCards = () => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  return (
    <div className="h-screen">
      <div className="h-full w-full flex flex-col gap-y-5 justify-center items-center">
        <div className="loader relative h-20 p-1 border-gray-300 w-[50%] border-4 rounded-lg">
          <div
            className="bg-gray-300 h-full ease-in-out transition-all duration-300 rounded"
            style={{
              width: `${(
                (currentPage / flashCardQuestions.length) *
                100
              ).toFixed(0)}%`,
            }}
          ></div>
          <div className="absolute z-10 left-4 top-1/3">
            {((currentPage / flashCardQuestions.length) * 100).toFixed(0)}%
          </div>
          <div className="absolute right-4 top-1/3">
            {currentPage + 1} of {flashCardQuestions.length}
          </div>
        </div>

        <div className="w-[50%] h-[50%] border-4 border-gray-300 rounded-lg  flex flex-col  p-2">
          <div className="flex-1 text-center text-xl flex items-center justify-center wrap-break-word p-4 bg-gray-100 mb-2 rounded-lg">
            {showAnswer ? (
              <p>{flashCardQuestions[currentPage].answer}</p>
            ) : (
              <p>{flashCardQuestions[currentPage].question}</p>
            )}
          </div>

          <div className="h-20 bg-gray-300 flex justify-between items-center text-xl text-gray-600 font-medium px-4 rounded-lg">
            <p
              onClick={() => setCurrentPage(currentPage - 1)}
              className={`hover:cursor-pointer flex gap-x-2 items-center ${
                currentPage <= 0 && "pointer-events-none text-gray-400"
              }`}
            >
              <ChevronLeft /> Previous
            </p>

            <p
              className="text-black hover:cursor-pointer"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </p>

            <p
              onClick={() => setCurrentPage(currentPage + 1)}
              className={`hover:cursor-pointer flex gap-x-2 items-center ${
                currentPage >= flashCardQuestions.length - 1 &&
                "pointer-events-none text-gray-400"
              }`}
            >
              Next <ChevronRight />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;
