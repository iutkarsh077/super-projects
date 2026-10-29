
import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  Mic,
  MicOff,
  AudioLines,
  CircleCheck,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

const RecordingMedia = () => {
  const [isStart, setIsStart] = useState(false);
  const [isVoice, setIsVoice] = useState(false);
  const [audioRes, setAudioRes] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunkRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  const cleanup = async () => {
    cancelAnimationFrame(animationRef.current);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed"
    ) {
      await audioContextRef.current.close();
    }

    audioContextRef.current = null;
    setIsVoice(false);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError("");
      setAudioRes("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access requires HTTPS or localhost.");
      }

      if (typeof MediaRecorder === "undefined") {
        throw new Error("Your browser does not support audio recording.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      chunkRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunkRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunkRef.current, {
            type: recorder.mimeType || "audio/webm",
          });

          if (!blob.size) {
            throw new Error("No audio was recorded. Please try again.");
          }

          const url = URL.createObjectURL(blob);

          setAudioUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return url;
          });

          setIsLoading(true);

          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const response = await fetch("http://localhost:3000/audio", {
            method: "POST",
            body: formData,
          });

          const contentType = response.headers.get("content-type") || "";
          const result = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

          if (!response.ok) {
            throw new Error(
              typeof result === "string"
                ? result
                : result.message || "Transcription failed."
            );
          }

          const transcript =
            typeof result === "string"
              ? result
              : result.transcript ?? result.text ?? "";

          setAudioRes(transcript || "No speech detected in this recording.");
        } catch (err) {
          setError(err.message || "Failed to process the recording.");
        } finally {
          setIsLoading(false);
          await cleanup();
          recorderRef.current = null;
          chunkRef.current = [];
        }
      };

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      source.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);

      const detectVoice = () => {
        analyser.getByteTimeDomainData(data);

        let sum = 0;

        for (const value of data) {
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        }

        const rms = Math.sqrt(sum / data.length);
        setIsVoice(rms > 0.03);

        animationRef.current = requestAnimationFrame(detectVoice);
      };

      recorder.start();
      setIsStart(true);
      detectVoice();
    } catch (err) {
      setError(err.message || "Unable to access your microphone.");
      await cleanup();
      setIsStart(false);
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setIsStart(false);
      setIsVoice(false);
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetRecorder = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setAudioRes("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#0b1020] bg-[radial-gradient(ellipse_at_50%_0%,#243b67_0%,transparent_50%)] px-4 py-10 font-sans text-slate-100 flex items-center justify-center">
      <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/50 bg-[#11182b]/95 p-5 shadow-2xl shadow-black/30 sm:p-8">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
            <AudioLines size={24} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              Voice Studio
            </h1>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Record, listen and transcribe your voice.
            </p>
          </div>

          <span className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-[10px] font-bold tracking-wider text-slate-300">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            AUDIO
          </span>
        </header>

        {/* Recording area */}
        <div className="relative mt-7 flex min-h-[310px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700/40 bg-[#121a2d] px-4 py-8">
          <div className="pointer-events-none absolute h-52 w-52 rounded-full border border-indigo-400/10" />
          <div className="pointer-events-none absolute h-40 w-40 rounded-full border border-indigo-400/15" />

          <div
            className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-indigo-300/40 bg-gradient-to-br from-indigo-700 to-indigo-500 text-indigo-100 shadow-[0_0_0_12px_rgba(99,102,241,0.08),0_12px_40px_rgba(79,70,229,0.3)] ${
              isStart ? "animate-pulse" : ""
            }`}
          >
            {isVoice ? (
              <AudioLines size={40} strokeWidth={1.7} />
            ) : (
              <Mic size={40} strokeWidth={1.7} />
            )}
          </div>

          <span
            className={`mt-9 text-[10px] font-bold tracking-[0.18em] ${
              isStart ? "text-rose-300" : "text-slate-400"
            }`}
          >
            {isStart ? "● RECORDING IN PROGRESS" : "READY TO RECORD"}
          </span>

          <h2 className="mt-3 text-center text-xl font-bold tracking-tight sm:text-2xl">
            {isStart
              ? isVoice
                ? "We hear you!"
                : "Listening to your voice..."
              : audioUrl
                ? "Recording complete"
                : "Capture your voice"}
          </h2>

          <p className="mt-2 text-center text-xs leading-6 text-slate-400">
            {isStart
              ? "Speak clearly into your microphone."
              : audioUrl
                ? "Your audio is ready for playback."
                : "Press the button below when you're ready."}
          </p>
        </div>

        {/* Voice detection status */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-700/70 bg-[#151e31] p-4">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isStart && isVoice
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                : isStart
                  ? "animate-pulse bg-amber-400"
                  : "bg-slate-500"
            }`}
          />

          <div>
            <p className="text-xs font-semibold text-slate-100">
              {isStart
                ? isVoice
                  ? "Voice detected"
                  : "Waiting for speech"
                : "Microphone status"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {isStart
                ? "Live audio analysis"
                : "Microphone activates when you start"}
            </p>
          </div>

          <div className="ml-auto text-slate-400">
            {isVoice ? <AudioLines size={20} /> : <MicOff size={20} />}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex gap-3">
          {isStart ? (
            <button
              onClick={stopRecording}
              className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-500 px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/20 active:translate-y-0"
            >
              <Pause size={19} fill="currentColor" />
              Stop recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={19} fill="currentColor" />
              Start recording
            </button>
          )}

          {audioUrl && !isStart && (
            <button
              onClick={resetRecorder}
              disabled={isLoading}
              title="Record again"
              aria-label="Record again"
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#151e31] text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RotateCcw size={19} />
            </button>
          )}
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] text-slate-400">
          <Mic size={13} />
          Your microphone is active only while recording.
        </p>

        {/* Errors */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-xs leading-6 text-rose-300"
          >
            {error}
          </div>
        )}

        {/* Audio playback */}
        {audioUrl && (
          <section className="mt-6 rounded-2xl border border-slate-700/70 bg-[#121a2b] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
                <AudioLines size={20} />
              </div>

              <div>
                <h3 className="text-sm font-bold">Your recording</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Listen to your captured audio
                </p>
              </div>

              <CircleCheck className="ml-auto text-emerald-400" size={21} />
            </div>

            <audio
              className="h-11 w-full"
              controls
              src={audioUrl}
            >
              Your browser does not support audio playback.
            </audio>
          </section>
        )}

        {/* Transcription */}
        {(isLoading || audioRes) && (
          <section className="mt-5 rounded-2xl border border-slate-700/70 bg-[#121a2b] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                <AudioLines size={20} />
              </div>

              <div>
                <h3 className="text-sm font-bold">Transcription</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Speech recognition result
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-3 rounded-xl bg-[#0b1220] p-4 text-xs text-indigo-300">
                <LoaderCircle size={18} className="animate-spin" />
                Processing your audio...
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-700/60 bg-[#0b1220] p-4 text-sm leading-7 text-slate-200">
                {audioRes}
              </p>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-7 flex flex-wrap justify-between gap-3 border-t border-slate-700/60 pt-5 text-[9px] font-semibold tracking-widest text-slate-500">
          <span>VOICE STUDIO</span>
          <span>RECORD · LISTEN · TRANSCRIBE</span>
        </footer>
      </section>
    </main>
  );
};

export default RecordingMedia;
