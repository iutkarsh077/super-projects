import { Routes, Route } from "react-router-dom"
import Homepage from "./HomePage"
import LoginPage from "./LoginPage";
const CustomRoutes = () =>{
    return (
        <Routes>
            <Route path="/" element={<Homepage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
        </Routes>
    )
}

export default CustomRoutes;