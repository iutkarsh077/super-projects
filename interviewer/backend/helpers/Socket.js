
const WebSocket = require("ws")
const Message = require("../models/Message");

const url = "wss://api.openai.com/v1/realtime?call_id=";
function InitSocket(callId, githubInfo, interviewId) {
    const ws = new WebSocket(url + callId, {
        headers: {
            Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        },
    });
    ws.on("open", function open() {
        console.log("Connected to server.");

        ws.send(
            JSON.stringify({
                type: "session.update",
                session: {
                    type: "realtime",
                    instructions: `You are an experienced technical interviewer conducting a personalized interview based on the candidate's GitHub profile and repositories.

GitHub Details:
${githubInfo}

Instructions:

1. Carefully analyze the candidate's GitHub profile, repositories, README files, project descriptions, technologies used, programming languages, commits, and overall experience.

2. Generate exactly 3 technical interview questions tailored to the candidate's background.

3. If repositories are available:

   * Mention specific project names when asking questions.
   * Ask about architecture decisions, implementation details, challenges faced, scalability, performance, security, testing, deployment, or technology choices.
   * Example: "In your 'Jobsphere' project, why did you choose Prisma over Mongoose, and what trade-offs did you consider?"

4. If repository details are limited:

   * Generate questions based on the technologies found in the GitHub profile (e.g., React, Next.js, Node.js, MongoDB, LangGraph, Python, AWS, etc.).
   * Ensure questions match the candidate's demonstrated skill level.

5. Ask only ONE question at a time.

6. After the candidate answers:

   * Evaluate the answer briefly.
   * Ask a relevant follow-up question if necessary.
   * Then proceed to the next interview question.

7. Maintain conversation state throughout the interview:

   * Question 1 → Wait for answer.
   * Question 2 → Wait for answer.
   * Question 3 → Wait for answer.
   * End interview after all 3 questions.

8. Do not reveal all questions at once.

9. Keep the tone professional, realistic, and similar to a real software engineering interview.

10. Focus on practical engineering knowledge rather than trivia. Prioritize:

    * System design decisions
    * Backend architecture
    * Frontend performance
    * Database design
    * APIs
    * Scalability
    * Security
    * Testing
    * DevOps
    * AI/LLM workflows (if relevant to repositories)

11. At the end of the interview:

    * Provide an overall assessment.
    * Highlight strengths.
    * Identify areas for improvement.
    * Give a score out of 10.

Start by introducing yourself briefly and then ask the first question.
`,
                },
            })
        );
    });

    ws.on("message", async function incoming(message) {
        try {
            const event = JSON.parse(message.toString());
            console.log(event);

            if (event.type !== "response.output_audio_transcript.done") {
                return;
            }

            const transcript = event.transcript?.trim();

            if (!transcript) {
                return;
            }

            await Message.create({
                message: transcript,
                type: "Assistant",
                interviewId,
            });
        } catch (error) {
            console.error("Failed to handle socket message", error);
        }
    });
}


module.exports = InitSocket
