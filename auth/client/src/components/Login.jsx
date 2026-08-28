import { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [formDetails, setFormDetails] = useState({
        email: "",
        password: ""
    });

    const handleRegisterUser = async () => {
        console.log(formDetails);

        try {
            const res = await api.post("/login", formDetails);
            console.log(res);
            if(res.status !== 200){
                throw new Error("Login failed");
            }
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
            <div className="flex flex-col gap-6 w-[33%] bg-gray-600 h-[33%] p-5 rounded-2xl">
                <input type="text" className="border  border-black rounded-md pl-2 h-10" value={formDetails.email} onChange={(e) => setFormDetails((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" />

                <input type="password" className="border  border-black rounded-md pl-2 h-10" value={formDetails.password} onChange={(e) => setFormDetails((prev) => ({ ...prev, password: e.target.value }))} placeholder="Enter your password" />

                <button onClick={handleRegisterUser} className="bg-blue-500 max-w-fit flex p-2 rounded-lg hover:cursor-pointer">Login</button>
            </div>
        </div>
    )
}


export default Login;