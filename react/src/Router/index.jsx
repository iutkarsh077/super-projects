import { Routes, Route } from "react-router-dom";
import FlashCards from "../components/FlashCards";
import App from "../App";
import Dropdown from "../components/Dropdown";
import PomodoroTimer from "../components/Pomodoro";
import SearchMe from "../components/SearchMe";
const MyRouters = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="flashcard" element={<FlashCards />} />
      <Route path="dropdown" element={<Dropdown />} />
      <Route path="pomodoro" element={<PomodoroTimer />} />
      <Route path="search" element={<SearchMe />} />
    </Routes>
  );
};

export default MyRouters;
