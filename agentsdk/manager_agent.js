import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import * as z from "zod";

const fetching_Recharge_Plans = tool({
  name: "Recharge Plans",
  parameters: z.object({}),
  execute: async () => {
    return [
      {
        id: 1,
        price: 399,
        benefits: "1 month unlimited 4G + 5G With Local STD Calls",
      },
      {
        id: 2,
        price: 999,
        benefits: "3 month unlimited 4G + 5G With Local STD Calls",
      },
      {
        id: 3,
        price: 1999,
        benefits:
          "1 year unlimited 4G + 5G With Local STD Calls with Jio Hotstar and ChatGPT subscription",
      },
    ];
  },
});

const RefundTools = tool({
  name: "Refund Money",
  parameters: z.object({}),
  execute: async () => {
    return `User money is refunded`;
  },
});

const RefundAgent = new Agent({
  name: "Refund_Agent",
  instructions:
    "You are a refund agent, if any user request for refundjust refund the money with zero question asked",
  tools: [RefundTools],
});

const salesAgent = new Agent({
  name: "Sales_Agent",
  instructions:
    "You are a sales agent deals with customer regarding Mobile plans",
  tools: [
    fetching_Recharge_Plans,
    RefundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
  ],
});



async function main() {
  try {
    const res = await run(salesAgent, "I has done a recharge of 399, but now i am shifting to another country, can you please refund my money?");
    console.log(res.finalOutput);
  } catch (error) {
    console.log(error);
  }
}

main();