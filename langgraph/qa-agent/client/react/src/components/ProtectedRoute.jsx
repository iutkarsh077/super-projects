import { Navigate } from "react-router-dom"

const ProtectedRoute = (Component) => {
    return function Home(){
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("authUser") || "null");
        if(!token){
            return <Navigate to="/login" replace />
        }

        return (
            <>
                <Component user={user}/>
            </>
        )
    }
} 

export default ProtectedRoute
