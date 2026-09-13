import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../helpers/api";

const Auth = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const authMutation = useMutation({
        mutationFn: (credentials) => api.post("/auth", credentials),
        onSuccess: ({ data }) => {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("authUser", JSON.stringify(data.user));
            navigate("/", { replace: true });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        authMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-gray-400 flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
            >
                <h1 className="text-3xl font-bold text-black text-center mb-8">
                    Sign in or create account
                </h1>

                <div className="mb-5">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-black mb-2"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full border border-black rounded-lg px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-black mb-2"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full border border-black rounded-lg px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                {authMutation.isError && (
                    <p className="mb-4 text-sm text-red-600">
                        {authMutation.error.response?.data?.message || "Something went wrong. Please try again."}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={authMutation.isPending}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                    {authMutation.isPending ? "Please wait..." : "Continue"}
                </button>
            </form>
        </div>
    );
};

export default Auth;
