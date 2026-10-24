import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log(data)
        const stream = await client.responses.create({
            model: "gpt-5.4-mini",
            input: [
                {
                    role: "user",
                    content: data
                }
            ],
            stream: true
        })

        const encoder = new TextEncoder();

        const reader = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        if (chunk.type === "response.output_text.delta") {
                            process.stdout.write(chunk.delta);
                            controller.enqueue(encoder.encode(chunk.delta));
                        }

                        if (chunk.type === "response.completed") {
                            process.stdout.write("Done");
                            controller.enqueue(encoder.encode("Done"));
                        }
                    }
                } catch (error) {
                    controller.error(error);
                }
            }
        })

        return new Response(reader, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        })
    } catch (error) {
        console.log(error);
        return Response.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}