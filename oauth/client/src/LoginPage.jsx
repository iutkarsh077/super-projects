const LoginPage = () =>{
    const handleLogin = () =>{
        window.location.href = "http://localhost:4000/auth/github";
    }
    return (
        <div>
            This is a Login Page
            <div className="w-full flex justify-center items-center">
                <button onClick={handleLogin} className="w-40 rounded-md hover:cursor-pointer hover:bg-gray-200 flex justify-center items-center p-2 gap-x-4 border border-gray-500">Login with Github</button>
            </div>
        </div>
    )
}

export default LoginPage