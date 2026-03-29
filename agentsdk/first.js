import "dotenv/config";
import { Agent, run } from "@openai/agents";

const agent = new Agent({
    name: "Assistant",
    instructions: "You are an agent that always respond with any random thing",
    model: "gpt-5-nano"
})

async function main(){
    try {
        const res = await run(agent, "hii, My name is Utkarsh Singh");
        console.log(res.finalOutput);
    } catch (error) {
        console.log(error);
    }
}


main();