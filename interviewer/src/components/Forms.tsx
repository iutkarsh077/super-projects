"use client";
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";
const Forms = () => {
    const [githubUrl, setGithubUrl] = useState("");
    const handleSubmit = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/api/github`, { githubUrl });
            console.log(res.data.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to submit github link")
        }
    }
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="flex gap-4">
                <Input onChange={(e) => setGithubUrl(e.target.value)} value={githubUrl} placeholder="Enter your Github Url" />
                <Button onClick={handleSubmit} className="hover:cursor-pointer">Lets Go</Button>
            </div>
        </div>
    )
}

export default Forms;