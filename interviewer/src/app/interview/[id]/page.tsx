"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const InterviewPage = () => {
    const params = useParams();
    const id = params.id;
    const audioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        (async () => {
            const pc = new RTCPeerConnection();

            // Set up to play remote audio from the model
            audioRef.current = document.createElement("audio");
            audioRef.current.autoplay = true;
            pc.ontrack = (e) => (audioRef.current!.srcObject = e.streams[0]);

            // Add local audio track for microphone input in the browser
            const ms = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            pc.addTrack(ms.getTracks()[0]);

            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
            const speechSocketUrl = backendUrl.replace(/^http/, "ws");
            const speechSocket = new WebSocket(`${speechSocketUrl}/speech/${id}`);
            const recorder = new MediaRecorder(ms, { mimeType: "audio/webm" });

            recorder.ondataavailable = async (event) => {
                if (event.data.size === 0 || speechSocket.readyState !== WebSocket.OPEN) {
                    return;
                }

                speechSocket.send(await event.data.arrayBuffer());
            };

            speechSocket.onopen = () => {
                recorder.start(500);
            };

            // Set up data channel for sending and receiving events
            pc.createDataChannel("oai-events");

            // Start the session using the Session Description Protocol (SDP)
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const sdpResponse = await fetch(`${backendUrl}/api/session/${id}`, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    "Content-Type": "application/sdp",
                },
            });

            const answer = {
                type: "answer" as const,
                sdp: await sdpResponse.text(),
            };
            await pc.setRemoteDescription(answer);

            return () => {
                recorder.stop();
                speechSocket.close();
                pc.close();
                ms.getTracks().forEach((track) => track.stop());
            };
        })();
    }, [id]);
    return (
        <>
            <div>
                hey this is interview page {id}
                <audio ref={audioRef} autoPlay></audio>
            </div>
        </>
    )
}


export default InterviewPage;
