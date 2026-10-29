
import { useRef } from "react";

const MediaAccess = () => {
    const streamRef = useRef(null);
    const recordingRef = useRef(null);
    const chunksRef = useRef([]);

    const StartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            streamRef.current = stream;
            chunksRef.current = [];

            const recorder = new MediaRecorder(stream);
            recordingRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.start();
            console.log("Recording started");
        } catch (error) {
            console.error("Recording error:", error);
        }
    };

    const stopRecording = () => {
        const recorder = recordingRef.current;

        if (!recorder || recorder.state === "inactive") return;

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, {
                type: recorder.mimeType,
            });

            console.log("Blob size:", blob.size);
            console.log("MIME type:", blob.type);

            if (blob.size === 0) {
                console.error("No audio data recorded");
                return;
            }

            const audioUrl = URL.createObjectURL(blob);

            const audio = document.createElement("audio");
            audio.controls = true;
            audio.src = audioUrl;

            document.body.appendChild(audio);

            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = "recorder.webm";
            link.click();

            streamRef.current?.getTracks().forEach((track) => {
                track.stop();
            });

            streamRef.current = null;
            recordingRef.current = null;
            chunksRef.current = [];
        };

        recorder.stop();
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center gap-4">
            <button onClick={StartRecording}>
                Start
            </button>

            <button onClick={stopRecording}>
                Stop
            </button>
        </div>
    );
};

export default MediaAccess;
