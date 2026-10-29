
import { useEffect, useState } from "react";
import { AudioLines, Play, Sparkles, Volume2 } from "lucide-react";

const TextToSpeech = () => {
    const [text, setText] = useState(
        "Artificial Intelligence (AI) is a branch of computer science that enables machines to learn, reason, and perform tasks that typically require human intelligence. By analyzing vast amounts of data using advanced algorithms, AI powers everyday tools like virtual assistants, navigation apps, and personalized recommendations. It also drives major breakthroughs in critical fields such as healthcare diagnostics, finance, and automated manufacturing. While AI greatly improves efficiency, speed, and problem-solving capabilities, it raises important challenges regarding data privacy, ethical use, and potential job displacement."
    );

    const [audioUrl, setAudioUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleSend = async () => {
        if (!text.trim()) {
            setError("Please enter some text first.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:3000/tts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                throw new Error("Unable to generate audio. Please try again.");
            }

            const blob = await res.blob();

            if (audioUrl) URL.revokeObjectURL(audioUrl);

            setAudioUrl(URL.createObjectURL(blob));
        } catch (error) {
            setError(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F4EF] px-4 py-10 text-[#201D1A] sm:px-6 lg:py-16">
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9D8CC] text-[#A34F35]">
                        <AudioLines size={28} strokeWidth={1.8} />
                    </div>

                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#A34F35]">
                        AI Audio Studio
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                        Give your words a voice.
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#77716B] sm:text-base">
                        Turn written text into natural-sounding speech in seconds.
                        Simple, clear, and ready to listen.
                    </p>
                </header>

                {/* Main Card */}
                <main className="rounded-3xl border border-[#E9E2D9] bg-white p-5 shadow-[0_12px_50px_rgba(48,36,24,0.06)] sm:p-8">

                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Your script
                            </h2>
                            <p className="mt-1 text-sm text-[#89817A]">
                                Enter the text you want to hear.
                            </p>
                        </div>

                        <span className="rounded-full bg-[#F7F4EF] px-3 py-1.5 text-xs font-medium text-[#71665D]">
                            English
                        </span>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing your script..."
                        rows={9}
                        className="w-full resize-y rounded-2xl border border-[#E9E2D9] bg-[#FCFBF9] p-4 text-sm leading-7 text-[#302A25] outline-none transition placeholder:text-[#B0A79F] focus:border-[#B86B50] focus:ring-4 focus:ring-[#B86B50]/10 sm:p-5"
                    />

                    <div className="mt-3 flex items-center justify-between text-xs text-[#89817A]">
                        <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
                        <span>{text.length} characters</span>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#201D1A] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#A34F35] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Generating your audio...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Convert to speech
                            </>
                        )}
                    </button>

                    {error && (
                        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {/* Audio Result */}
                    {audioUrl && (
                        <section className="mt-7 rounded-2xl border border-[#E8D6C9] bg-[#FBF5F0] p-5 sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9D8CC] text-[#A34F35]">
                                    <Volume2 size={22} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold">
                                        Your audio is ready
                                    </h3>
                                    <p className="mt-1 text-xs text-[#89817A]">
                                        Generated speech · MP3
                                    </p>
                                </div>

                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#A34F35]">
                                    Ready
                                </span>
                            </div>

                            <audio
                                controls
                                src={audioUrl}
                                className="w-full"
                            />

                            <a
                                href={audioUrl}
                                download="generated-speech.mp3"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A34F35] transition hover:text-[#783B29]"
                            >
                                Download audio
                            </a>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-6 flex items-center justify-center gap-2 text-xs text-[#89817A]">
                    <Play size={12} fill="currentColor" />
                    <span>Powered by AI text-to-speech</span>
                </footer>
            </div>
        </div>
    );
};

export default TextToSpeech;
