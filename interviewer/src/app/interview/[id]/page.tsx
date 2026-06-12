"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const InterviewPage = () => {
    const params = useParams();
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

            // Set up data channel for sending and receiving events
            pc.createDataChannel("oai-events");

            // Start the session using the Session Description Protocol (SDP)
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const sdpResponse = await fetch("/api/session", {
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
        })();
    }, []);
    return (
        <>
            <div>
                hey this is interview page {params.id}
                <audio ref={audioRef} autoPlay></audio>
            </div>
        </>
    )
}


export default InterviewPage;
