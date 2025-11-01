import Home from "./components/Home";
import Cart from "./components/Cart";
import { Route, Routes } from "react-router-dom";
import App from "./App";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/cart" element={<Cart />} />
      </Route>
    </Routes>
  );
};

export default Router;
