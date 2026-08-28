import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useGetuserinfoQuery } from "../store/GetUser";
import { Loader2 } from "lucide-react"
import { useDispatch } from "react-redux";
import { AddUserInfo } from "../features/UserSlice";
import { useEffect } from "react";

const ProtectedRoute = () => {
    const { data, error, isLoading } = useGetuserinfoQuery();
    const navigate = useNavigate();

    const dispatch = useDispatch();


    useEffect(() => {
        if (data) {
            console.log(data)
            dispatch(AddUserInfo(data));
            navigate("/")
        }
    }, [data, dispatch]);

    if (isLoading) {
        return (
            <div className="w-screen h-screen overflow-hidden flex justify-between items-center">
                <Loader2 className="animate-spin text-lack w-5 h-5" />
            </div>
        )
    }

    if (error) {
        <div className="w-screen h-screen overflow-hidden flex justify-between items-center">
            <span className="text-red-500">Failed to get user info</span>
        </div>
    }
    if (!data) {
        return <Navigate to={"/login"} replace />
    }


    return (
        <>
            <Outlet />
        </>
    )
}

export default ProtectedRoute