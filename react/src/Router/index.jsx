import { Routes, Route } from "react-router-dom";
import FlashCards from "../components/FlashCards";
import App from "../App";
const MyRouters = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="flashcard" element={<FlashCards />} />
    </Routes>
  );
};

export default MyRouters;
