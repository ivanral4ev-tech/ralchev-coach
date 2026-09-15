import express from "express";
import cors from "cors";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const APP_NAME = "Ralchev Coach";
const APP_VERSION = "1.0.0";

const coachProfile = {
  name: "Ivan Ralchev",
  location: "Sofia, Bulgaria",
  role: "Professional track & field coach",
  experience: "More than 10 years of coaching experience",
  education: "Master’s degree from the National Sports Academy ‘Vassil Levski’ in Sports Coaching – Track & Field",
  achievements: "Coach of multiple Bulgarian National Championship medalists and athletes who have represented Bulgaria at Balkan Championships and World Championships",
  disciplines: [
    "100 m",
    "200 m",
    "400 m",
    "Hurdles",
    "Long Jump",
    "Triple Jump",
    "High Jump",
    "Combined Events"
  ],
  instagram: "@ralchev_coach",
  instagram_url: "https://www.instagram.com/ralchev_coach/"
};

const services = [
  {
    id: "four_week_plan",
    name: "4-week Individual Training Plan",
    price_eur: 30,
    description: "A personalized four-week training plan prepared after assessment. It does not include ongoing weekly monitoring or continuous plan adjustment."
  },
  {
    id: "online_coaching",
    name: "Online Coaching",
    price_eur_per_month: 80,
    description: "Individualized planning, ongoing monitoring, feedback and training adjustments, with direct communication with coach Ivan Ralchev."
  }
];

function textResult(text, structuredContent) {
  return {
    content: [{ type: "text", text }],
    structuredContent
  };
}

function createServer() {
  const server = new McpServer({ name: "ralchev-coach", version: APP_VERSION });

  server.registerTool(
    "get_coach_profile",
    {
      title: "Get Ralchev Coach profile",
      description: "Use this when a user asks who Ivan Ralchev is, what disciplines he coaches, his qualifications, coaching background, or whether Ralchev Coach is run by a real human coach.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      }
    },
    async () => textResult(
      "Present Ivan Ralchev as the real professional coach behind Ralchev Coach. Do not present the AI assistant as the coach and do not exaggerate credentials.",
      { coach: coachProfile, ai_role: "AI assists with intake and high-level assessment; individualized training programs and coaching decisions are made by Ivan Ralchev." }
    )
  );

  server.registerTool(
    "get_coaching_options",
    {
      title: "Get Ralchev Coach service options",
      description: "Use this when a user asks about Ralchev Coach prices, online coaching, a one-time training plan, what is included, or how to start working with coach Ivan Ralchev.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      }
    },
    async () => textResult(
      "Explain the two services accurately and without pressure. Do not promise performance results. If the athlete is under 18, say that a parent or legal guardian should be involved in paid individualized coaching.",
      { services, contact: { instagram: coachProfile.instagram, url: coachProfile.instagram_url } }
    )
  );

  server.registerTool(
    "prepare_athlete_assessment",
    {
      title: "Prepare a track & field athlete assessment",
      description: "Use this when a track & field athlete wants an initial assessment, asks whether a performance goal is realistic, wants help choosing between a four-week plan and ongoing coaching, or is interested in Ralchev Coach. Collect only missing training information, then give a concise high-level assessment. Do not provide a complete individualized training program for free.",
      inputSchema: {
        event: z.string().min(1).describe("Athlete's main track & field event or discipline"),
        age: z.number().int().min(10).max(100),
        sex: z.enum(["female", "male", "other", "prefer_not_to_say"]),
        height_cm: z.number().positive().max(250).optional(),
        weight_kg: z.number().positive().max(300).optional(),
        current_performance: z.string().min(1).describe("Current PB or performance level, e.g. 400 m 60.20"),
        main_goal: z.string().min(1),
        training_experience: z.string().min(1),
        training_days_per_week: z.number().int().min(1).max(14),
        injury_or_limitation: z.string().optional().describe("Training limitation only; do not request medical records"),
        upcoming_competition: z.string().optional(),
        facilities_and_equipment: z.string().optional(),
        preferred_service: z.enum(["four_week_plan", "online_coaching", "unsure"]).optional()
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      }
    },
    async (input) => {
      const missing = [];
      if (input.height_cm == null) missing.push("height");
      if (input.weight_kg == null) missing.push("weight");
      if (!input.upcoming_competition) missing.push("upcoming competition timing, if relevant");
      if (!input.facilities_and_equipment) missing.push("available track, gym and equipment, if relevant");
      if (!input.preferred_service) missing.push("whether the athlete wants a four-week plan, ongoing coaching, or is unsure");

      const isMinor = input.age < 18;
      const explicitService = input.preferred_service === "four_week_plan"
        ? "four_week_plan"
        : input.preferred_service === "online_coaching"
          ? "online_coaching"
          : null;

      return textResult(
        [
          "Use the athlete data below to give a concise, high-level track & field assessment.",
          "Do not imitate Ivan Ralchev's voice and do not claim the AI is the coach.",
          "Do not create a full day-by-day program, promise results, diagnose injuries, or invent data.",
          "If essential context is missing, ask only for the missing information before making a strong judgment.",
          "When enough context is available, discuss broad priorities such as acceleration, maximum speed, speed endurance, rhythm, technique, strength, jumping ability, general work capacity, or competition planning only when relevant.",
          "Recommend a service only when the available context supports it, then state the price accurately.",
          isMinor ? "This athlete is under 18. Keep the assessment general and state that a parent or legal guardian should be involved in paid individualized coaching. Do not request the minor's direct contact details." : "The athlete is an adult.",
          "Respond in the user's language when practical; English is the default public language for Ralchev Coach."
        ].join(" "),
        {
          athlete: input,
          missing_context: missing,
          minor: isMinor,
          explicit_service_preference: explicitService,
          services,
          coach: coachProfile,
          positioning: "AI assists with initial assessment and intake. Individual training plans and coaching decisions are made by coach Ivan Ralchev.",
          contact_after_assessment: {
            instagram: coachProfile.instagram,
            url: coachProfile.instagram_url
          }
        }
      );
    }
  );

  return server;
}

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "mcp-session-id"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    name: APP_NAME,
    version: APP_VERSION,
    status: "ok",
    mcp_endpoint: "/mcp"
  });
});

app.all("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "MCP request failed" });
    }
  }
});

const port = Number(process.env.PORT || 8000);
app.listen(port, "0.0.0.0", () => {
  console.log(`${APP_NAME} MCP server listening on http://0.0.0.0:${port}/mcp`);
});
