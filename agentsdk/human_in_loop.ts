import "dotenv/config";
import { Agent, run, RunResult, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import readline from 'node:readline/promises';

const GithubRepoInformationTool = tool({
  name: "Github User Information Provider",
  description: "This tool helps in getting the github repository information",
  needsApproval: true,
  parameters: z.object({
    username: z.string().describe("Github Username"),
    repoName: z.string().describe("Github Repository name"),
  }),
  execute: async ({ username, repoName }: {username: string, repoName: string}) => {
    console.log(`Username is: `, username);
    console.log("Repo name: ", repoName);
    const res = await axios.get(
      `https://api.github.com/repos/${username}/${repoName}`,
    );
    return res.data;
  },
});

const agent = new Agent({
  name: "Github_Info",
  instructions: "You are a assistant that helps to fetch information about public available github reppository.",
  tools: [GithubRepoInformationTool],
});


async function confirm(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(`${question} (y/n): `);
  const normalizedAnswer = answer.toLowerCase();
  rl.close();
  return normalizedAnswer === 'y' || normalizedAnswer === 'yes';
}


async function main() {
  try {
    let res: RunResult<unknown, Agent<unknown, any>> = await run(
      agent,
      "Get me the information about Snippets-SAAS-Production of username iutkarsh077",
    );

    let hasInteruptions = res.interruptions?.length > 0;

    while(hasInteruptions){
      const currentState = res.state;
      for(const intrupt of res.interruptions){
        if(intrupt.type === "tool_approval_item"){
          const isAllowed = await confirm(`Agent ${intrupt.agent.name} is asking for calling tool ${intrupt.name} with args ${intrupt.arguments}`)
          if(isAllowed){
            currentState.approve(intrupt)
          }else{
            currentState.reject(intrupt)
          }
          res = await run(agent, currentState);
          hasInteruptions = res.interruptions.length > 0;
        }
      }
    }
    console.log(res.finalOutput);
  } catch (error) {
    console.log(error);
  }
}

main();