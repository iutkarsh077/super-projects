import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import * as z from "zod";
import axios from "axios";
import nodemailer from "nodemailer"
import { EmailSender, emailTemplate, github, githubReposInformation } from "./constant.js";

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

const GithubRepoInformationTool = tool({
  name: "Github User Information Provider",
  parameters: z.object({
    username: z.string().describe("Github Username"),
    repoName: z.string().describe("Github Repository name"),
  }),
  execute: async ({ username, repoName }) => {
    console.log(`Username is: `, username);
    console.log("Repo name: ", repoName);
    const res = await axios.get(
      `https://api.github.com/repos/${username}/${repoName}`,
    );
    return res.data;
  },
});

const SendEmailToUserTool = tool({
  name: "Send email notification for greeting",
  parameters: z.object({
    email: z.string().describe("Email of the User"),
  }),
  execute: async ({ email }) => {
    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transport.verify();
      const name2 = email.split("@")[0];
      const sendResult = await transport.sendMail({
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: "Good morning 🌅",
        html: emailTemplate(name2),
      });

      return sendResult;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
});

const agent = new Agent({
  name: "Multi Work AGent like Github information and email notification sender",
  instruction: EmailSender,
  tools: [GithubInformationTool, GithubRepoInformationTool, SendEmailToUserTool],
});

async function main() {
  try {
    const res = await run(
      agent,
      "Send a email for good morning greet to utkarshsingh132002@gmail.com and utkarshsingh132003@gmail.com and utkarshsingh132004@gmail.com",
    );
    console.log(res.finalOutput);
  } catch (error) {
    console.log(error);
  }
}

main();
