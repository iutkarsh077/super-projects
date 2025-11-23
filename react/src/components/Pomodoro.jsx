import { useState, useEffect, useRef } from "react";

export default function PomodoroTimer() {
  const work_time = 25 * 60;
  const [secondLeft, setSecondLeft] = useState(work_time);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const formatTime = () => {
    const minutes = Math.floor(secondLeft / 60)
      .toString()
      .padStart(2, "0");
    const second = Math.floor(secondLeft % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes} : ${second}`;
  };

  const startTimer = () => {
    if (intervalRef.current !== null) return;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSecondLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setSecondLeft(work_time);
  };

  useEffect(()=>{
    return () => clearInterval(intervalRef.current);
  }, [])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="w-[20%] h-auto border-2 border-black p-4  text-center rounded-md hover:shadow-lg  hover:shadow-gray-500 transition-all ease-in-out duration-300">
        <div className="text-4xl font-semibold">{formatTime()}</div>
      <div className="flex gap-x-8 items-center justify-center mt-8">
        <p className="text-xl font-medium border-2 border-black hover:scale-110 ease-in-out transition-all duration-300 px-5 py-1 rounded-md hover:shadow-xl hover:cursor-pointer">
          {isRunning ? (
            <p onClick={pauseTimer}>Pause</p>
          ) : (
            <p onClick={startTimer}>Start</p>
          )}
        </p>
        <p
          onClick={resetTimer}
          className="text-xl font-medium border-2 border-black hover:scale-110 ease-in-out transition-all duration-300 px-5 py-1 rounded-md hover:shadow-xl hover:cursor-pointer"
        >
          Reset
        </p>
      </div>
      </div>
    </div>
  );
}
