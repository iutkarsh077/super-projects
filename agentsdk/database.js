import "dotenv/config";
import { MongoClient } from "mongodb";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import readline from "readline"

const uri = process.env.DB_URI;
const client = new MongoClient(uri);

async function GetMoviesByName({ name }) {
  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const result = await db
      .collection("movies")
      .findOne({ title: { $regex: name, $options: "i" } });
    console.log("Result from db is: ", result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function GetMoviesByPlot({ plot }) {
  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const result = await db
      .collection("movies")
      .findOne({ plot: { $regex: plot, $options: "i" } });
    console.log("Result from db is: ", result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function GetAllMoviesCount() {
  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const result = await db.collection("movies").countDocuments();
    console.log("Count result: ", result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

const GetMovieTool = tool({
  name: "Movie_QUery_Tool",
  parameters: z.object({
    name: z.string().describe("Name of the movie"),
  }),
  execute: GetMoviesByName,
});

const GetMovieByPlotTool = tool({
  name: "Movie_Plot_Query_Tool",
  parameters: z.object({
    plot: z.string().describe("Plot of the movie"),
  }),
  execute: GetMoviesByPlot,
});

const TotalMovieCountTool = tool({
  name: "DB_Movie_Counter",
  parameters: z.object({}),
  execute: GetAllMoviesCount,
});

const dbGuardRailAgent = new Agent({
  name: "GuardRail_AGent_for_Movie",
  instructions:
    "Check if the user is only asking about movie by using movie name, plot or get the total count of movies in the db. Only get request no delete update query would be asked by user",
  outputType: z.object({
    isSafeDBQuery: z.boolean(),
  }),
});

const dbGuardRail = {
  name: "DB_Search_Guardrail",
  runInParallel: false,
  execute: async ({ input, ctx }) => {
    const result = await run(dbGuardRailAgent, input);
    console.log("Is safe question: ", result.finalOutput);
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isSafeDBQuery === false,
    };
  },
};

const dbAgent = new Agent({
  name: "DB_Expert",
  instructions:
    "You are a database expert, if user ask about any movie by using movie name then query the movie by using tools and return the result,You MUST use the Movie_Query_Tool whenever the user asks about a movie. Extract the movie name and call the tool. Return the database result clearly. you can also return total movie count",
  tools: [GetMovieTool, TotalMovieCountTool, GetMovieByPlotTool],
  inputGuardrails: [dbGuardRail],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion() {
  return new Promise((resolve) => {
    rl.question("👉 Ask something: ", (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  while (true) {
    try {
      const query = await askQuestion();

      if (query.toLowerCase() === "exit") {
        console.log("Exiting...");
        rl.close();
        process.exit(0);
      }

      const result = await run(dbAgent, query, {
        conversationId: process.env.CONV_ID
      });
      console.log("🤖:", result.finalOutput);
    } catch (error) {
      console.log(error);
    }
  }
}

main();

// main("Do you have any movie related to family show?");

// Do you have any info about the The Poor Little Rich Girl?
