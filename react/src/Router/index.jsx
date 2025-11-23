import { Routes, Route } from "react-router-dom";
import FlashCards from "../components/FlashCards";
import App from "../App";
import Dropdown from "../components/Dropdown";
import PomodoroTimer from "../components/Pomodoro";
const MyRouters = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="flashcard" element={<FlashCards />} />
      <Route path="dropdown" element={<Dropdown />} />
      <Route path="pomodoro" element={<PomodoroTimer />} />
    </Routes>
  );
};

export default MyRouters;
