import "dotenv/config"
import { Agent, run, RunContext, tool } from "@openai/agents";

interface UserInfo {
    id: number,
    username: string
}

const agent = new Agent<UserInfo>({
    name: "Assistant",
    instructions: "You are a helpful assistant"
})

async function main(query: string, ctx: UserInfo){
    try {
        const result = await run(agent, query, {
            context: ctx
        })
        console.log(result.finalOutput)
    } catch (error) {
        console.log(error);
    }
}

main("What is my name?", {
    id: 1,
    username: "utkarsh"
})