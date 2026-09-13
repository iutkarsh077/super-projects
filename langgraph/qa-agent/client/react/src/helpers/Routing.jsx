import {Routes, Route } from "react-router-dom"
import App from "../App";
import Auth from "../components/Auth";
import Home from "../components/Home";
import ProtectedRoute from "../components/ProtectedRoute";

const ProtectedHome = ProtectedRoute(Home);

const Routing = () => {
    return (
        <Routes>
            <Route element={<App/>} path="/">
                <Route index={true} element={<ProtectedHome />} />
                <Route path="/login" element={<Auth/>}/>
            </Route>
        </Routes>
    )
}

export default Routing;
