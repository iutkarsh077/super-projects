import { useRef, useEffect, useState } from "react";
import {
    Mic,
    Square,
    AudioLines,
    Sparkles,
    Loader2,
    CircleCheck,
    AlertCircle
} from "lucide-react";

const VoiceAgent = () => {
    const streamRef = useRef(null);
    const recorderRef = useRef(null);
    const chunks = useRef([]);

    const [audioUrl, setAudioUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            setError("");
            setAudioUrl("");
            chunks.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            streamRef.current = stream;
            recorderRef.current = new MediaRecorder(stream);

            recorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            recorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            setError("Unable to access microphone. Please check permissions.");
            console.error(error);
        }
    };

    const stopRecording = () => {
        const recorder = recorderRef.current;

        if (!recorder || recorder.state === "inactive") return;

        recorder.onstop = async () => {
            setIsRecording(false);
            setLoading(true);

            try {
                const blob = new Blob(chunks.current, {
                    type: recorder.mimeType
                });

                if (!blob.size) {
                    throw new Error("No audio was recorded.");
                }

                const formData = new FormData();
                formData.append("audio", blob, "recording.webm");

                const res = await fetch("http://localhost:3000/voiceagent", {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) {
                    throw new Error("Unable to generate audio. Please try again.");
                }

                const blob2 = await res.blob();

                setAudioUrl(URL.createObjectURL(blob2));
            } catch (error) {
                setError(error.message || "Something went wrong.");
            } finally {
                setLoading(false);

                recorderRef.current = null;
                chunks.current = [];

                streamRef.current?.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        recorder.stop();
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-5">
                        <Sparkles className="w-8 h-8 text-violet-400" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        AI Voice Agent
                    </h1>

                    <p className="text-zinc-400 mt-3 text-sm">
                        Speak naturally. Let AI transform your voice.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-7 sm:p-10 shadow-2xl">

                    {/* Status */}
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-sm text-zinc-400">
                            Recording studio
                        </span>

                        <div className="flex items-center gap-2 bg-zinc-800/70 px-3 py-1.5 rounded-full">
                            <span className={`w-2 h-2 rounded-full ${
                                isRecording
                                    ? "bg-red-500 animate-pulse"
                                    : loading
                                        ? "bg-yellow-400 animate-pulse"
                                        : "bg-emerald-400"
                            }`} />

                            <span className="text-xs text-zinc-300">
                                {isRecording
                                    ? "Recording"
                                    : loading
                                        ? "Processing"
                                        : "Ready"}
                            </span>
                        </div>
                    </div>

                    {/* Microphone Animation */}
                    <div className="flex flex-col items-center py-8">

                        <div className={`relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-300 ${
                            isRecording
                                ? "bg-red-500/10 border border-red-500/30"
                                : "bg-violet-500/10 border border-violet-500/20"
                        }`}>

                            {isRecording && (
                                <>
                                    <div className="absolute inset-0 rounded-full border border-red-500/40 animate-ping" />
                                    <div className="absolute inset-[-12px] rounded-full border border-red-500/20 animate-pulse" />
                                </>
                            )}

                            <div className={`flex items-center justify-center w-24 h-24 rounded-full ${
                                isRecording ? "bg-red-500" : "bg-violet-600"
                            }`}>
                                <Mic className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold mt-8">
                            {isRecording
                                ? "Listening to you..."
                                : loading
                                    ? "Generating your audio..."
                                    : "Ready to listen"}
                        </h2>

                        <p className="text-sm text-zinc-500 mt-2 text-center">
                            {isRecording
                                ? "Speak clearly into your microphone"
                                : loading
                                    ? "Your voice is being processed by AI"
                                    : "Press the button below to start speaking"}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-4 mt-6">

                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-violet-600/20"
                            >
                                <Mic size={20} />
                                Start Recording
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-semibold shadow-lg shadow-red-500/20"
                            >
                                <Square size={18} fill="currentColor" />
                                Stop Recording
                            </button>
                        )}

                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="mt-8 flex items-center justify-center gap-3 text-violet-400">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-sm">Processing your recording...</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Generated Audio */}
                    {audioUrl && (
                        <div className="mt-8 p-5 rounded-2xl bg-zinc-900 border border-zinc-800">

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <AudioLines className="text-emerald-400" size={22} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-sm">
                                        Generated Audio
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Your AI-generated response is ready
                                    </p>
                                </div>

                                <div className="ml-auto">
                                    <CircleCheck className="text-emerald-400" size={20} />
                                </div>
                            </div>

                            <audio
                                src={audioUrl}
                                controls
                                className="w-full h-11"
                            />
                        </div>
                    )}

                </div>

                {/* Footer */}
                <p className="text-center text-xs text-zinc-600 mt-7">
                    <span className="inline-flex items-center gap-2">
                        <AudioLines size={14} />
                        Powered by AI Voice Processing
                    </span>
                </p>

            </div>
        </div>
    );
};

export default VoiceAgent;