import { Routes, Route } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Checkboxes from "../components/Checkboxes";

const MyRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkbox" element={<Checkboxes />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
            </Route>
        </Routes>
    )
}

export default MyRoutes;