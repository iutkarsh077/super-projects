import { useRef } from "react";

const MediaAccess = () => {
    const streamRef = useRef(null);
    const recorderRef = useRef(null);
    let chunks = [];
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            })

            streamRef.current = stream;

            const audioContext = new AudioContext();

            const source = audioContext.createMediaStreamSource(stream);

            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.5;

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            recorderRef.current = new MediaRecorder(stream);

            recorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    console.log(e.data);
                    chunks.push(e.data);
                }
            }

            recorderRef.current.start();

        } catch (error) {
            console.log(error);
        }
    }


    const stopStream = () => {
        try {
            let recorder = recorderRef.current;

            if (!recorder || recorder.state === "inactive") return;

            recorder.onstop = () => {
                const blob = new Blob(chunks, {
                    type: recorder.mimeType
                });

                const audioUrl = URL.createObjectURL(blob);

                const audio = new Audio(audioUrl);
                audio.controls = true;
                document.body.appendChild(audio);

                const a = document.createElement("a");
                a.href = audioUrl;
                a.download = "recorder.webm";
                a.click();

                // URL.revokeObjectURL(audioUrl);

                streamRef.current?.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                recorderRef.current = null;
                chunks = [];
            }

            recorder.stop();
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center gap-4">
            <button className="bg-black border hover:cursor-pointer px-4 py-2 text-white rounded-md" onClick={startRecording}>Start</button>
            <button className="bg-black border hover:cursor-pointer px-4 py-2 text-white rounded-md" onClick={stopStream}>Stop</button>
        </div>
    )
}

export default MediaAccess;