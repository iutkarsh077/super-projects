import { useRef, useState } from "react";

const MediaAccess = () => {
    const streamRef = useRef(null);
    const startRecording = async () => {
        try {
            if (streamRef.current) return;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            })
            console.log(stream);
            streamRef.current = stream;
            console.log("microphone access granted");
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    const stopStream = async () => {
        const list = streamRef.current?.getTracks();
        console.log("list: ", list);
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        console.log("microphone stopped")
    }
    return (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center gap-4">
            <button className="bg-black border hover:cursor-pointer px-4 py-2 text-white rounded-md" onClick={startRecording}>Start</button>
            <button className="bg-black border hover:cursor-pointer px-4 py-2 text-white rounded-md" onClick={stopStream}>Stop</button>
        </div>
    )
}

export default MediaAccess;