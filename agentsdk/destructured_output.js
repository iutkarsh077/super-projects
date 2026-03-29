import "dotenv/config"
import { Agent, run, tool } from "@openai/agents";
import axios from "axios";
import * as z from "zod";

const GithubInformationTool = tool({
  name: "Github User Information Provider",
  parameters: z.object({
    username: z.string().describe("Github Username"),
  }),
  execute: async ({ username }) => {
    const res = await axios.get(`https://api.github.com/users/${username}`);
    return res.data;
  },
});

const githubUserOutputSchema = z.object({
    avatar: z.string().describe("Avatar Url of the user"),
    RepoCount: z.string().describe("Total Count of Public Repository"),
    Followers: z.string().describe("Total Count of Followers"),
    Following: z.string().describe("Total Count of Following")
})

const agent = new Agent({
  name: "Github Information Agent",
  instruction: "You are a agent that gives information about the github user in a specified format",
  tools: [GithubInformationTool],
  outputType: githubUserOutputSchema
});

async function main() {
  try {
    const res = await run(
      agent,
      "GIve me the github information of user iutkarsh077",
    );
    console.log(res.finalOutput);
  } catch (error) {
    console.log(error);
  }
}

main();
