import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom"
import { loggedInUser } from "../features/UserSlices";

const ProtectedRoute = (Component) => {
    return function Home(){
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("authUser") || "null");
        const dispatch = useDispatch();

        if(!token){
            return <Navigate to="/login" replace />
        }

        if(user){
            dispatch(loggedInUser(null))
        }

        return (
            <>
                <Component user={user}/>
            </>
        )
    }
} 

export default ProtectedRoute
