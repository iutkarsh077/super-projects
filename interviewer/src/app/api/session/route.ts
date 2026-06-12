import { NextRequest, NextResponse } from "next/server";

const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
});

export async function POST(req: NextRequest) {
    try {
        const sdpOffer = await req.text();
        const fd = new FormData();
        fd.set("sdp", sdpOffer);
        fd.set("session", sessionConfig);

        const r = await fetch("https://api.openai.com/v1/realtime/calls", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "OpenAI-Safety-Identifier": "hashed-user-id",
            },
            body: fd,
        });
        const sdp = await r.text();

        if (!r.ok) {
            return NextResponse.json(
                { error: "OpenAI Realtime session failed", details: sdp },
                { status: r.status }
            );
        }

        return new NextResponse(sdp, {
            headers: {
                "Content-Type": "application/sdp",
            },
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
