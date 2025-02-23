import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

dotenv.config();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from JARVIS",
  });
});

app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const formattedPrompt = `

${prompt}

`;

    const command = new InvokeModelCommand({
      modelId: "us.meta.llama3-3-70b-instruct-v1:0", // Replace with your Bedrock model ID
      contentType: "application/json",
      body: JSON.stringify({
        prompt: formattedPrompt,
        max_gen_len: 400,
        temperature: 0.5,
        top_p: 0.8,
      }),
    });

    const response = await bedrockClient.send(command);
    const nativeResponse = JSON.parse(new TextDecoder().decode(response.body));
    const responseText = nativeResponse.generation;

    res.status(200).send({
      bot: responseText,
    });
  } catch (error) {
    console.error("Error invoking Llama 3:", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(5001, () =>
  console.log("Server is running on port http://localhost:5001")
);
