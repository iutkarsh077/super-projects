import { useDispatch, useSelector } from "react-redux";
import { LogoutUser } from "../features/UserSlice";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const userdata = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = api.get("/logout");
            dispatch(LogoutUser("logout"))
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div>
            This is a dashboard
            <span>User name is {userdata.userinfo.name?.toUpperCase()}, email is {userdata.userinfo?.email}</span>

            <div onClick={handleLogout} className="bg-red-500 max-w-fit  p-2 rounded-lg hover:cursor-pointer">Logout</div>
        </div>
    )
}

export default Dashboard;