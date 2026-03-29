import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
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

const salesAgent = new Agent({
  name: "Sales_agent",
  instructions: `You are a sales agent deals with customer regarding Mobile plans`,
  tools: [fetching_Recharge_Plans],
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
    "You are a refund agent, if any user request for refund just refund the money after checking is the refund price available in Recharge Plans if not available roast the user  else return the money",
  tools: [RefundTools],
});

const ReceptionAgent = new Agent({
  name: "Reception_Handoff_Agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX} You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent`,
  handoffDescription: `You have two agents available:
    - salesAgent: Expert in handling queries like all plans and pricing available. Good for new customers.
    - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them`,
    handoffs: [salesAgent, RefundAgent]
});


async function main(query){
    try {
        const res = await run(ReceptionAgent, query);
        console.log("Final Output is: ", res.finalOutput);
        console.log("History is: ", res.history);
    } catch (error) {
        console.log(error);
    }
}


main("I want refund on my 1999 Recharge, because i am shifting to another country")