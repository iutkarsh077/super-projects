import "dotenv/config";
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const mathGuardRailAgent = new Agent({
  name: "Guardrail check",
  instructions: "Check if the user is asking you to do their math homework.",
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string(),
  }),
});

const mathGuardRail = {
  name: "Math homework GuardRail",
  runInParallel: false,
  execute: async ({ input, context }) => {
    const result = await run(mathGuardRailAgent, input, {context});
    return {
        outputInfo: result.finalOutput,
        tripwireTriggered: result.finalOutput?.isMathHomework === false,
    }
  },
};

const MathAgent = new Agent({
  name: "Math_Expert",
  instructions: "You are a senior mathematician teacher.",
  inputGuardrails: [mathGuardRail],
});


MathAgent.on("agent_start", (ctx, agent)=>{
  console.log(agent.name, "Agent started...")
})

MathAgent.on("agent_end", (ctx, agent)=>{
  console.log(agent.name, "Agent ended...")
})

async function main() {
  try {
    const res = await run(MathAgent, 'Multiple 6882687267 with 986867637');
    console.log("Answer: ", res.finalOutput);
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log('Math homework guardrail tripped');
    }
  }
}

main().catch(console.error);