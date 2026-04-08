'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIJob {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  author: string | null;
}

interface AIMatchResult {
  recommendedReferenceModule: string;
  whyItFitsYourProfile: string;
  howToContribute: string;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const FALLBACK_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
];
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1_000;

function buildPrompt(userSkills: string, jobs: AIJob[]) {
  return [
    "You are a Technical Onboarding Assistant for the Intern Community Hub.",
    "Analyze the student's skills against the existing community modules below and choose the single best reference module for them to learn from and improve.",
    "Respond entirely in professional English.",
    "Keep the tone helpful, technical, and realistic.",
    "The recommendedReferenceModule must exactly match one module title from the provided list.",
    "Keep whyItFitsYourProfile concise and focused on the technical match between the student's skills and the module's stack.",
    "Keep howToContribute specific and focused on one realistic feature or improvement the student could implement before submitting to the Admin.",
    'Return only valid JSON in this exact format: {"recommendedReferenceModule":"...","whyItFitsYourProfile":"...","howToContribute":"..."}',
    "",
    `Student skills: ${userSkills}`,
    "",
    "Existing community modules:",
    ...jobs.map(
      (job, index) =>
        `${index + 1}. ${job.title} | Category: ${job.category} | Votes: ${job.votes} | Author: ${job.author ?? "Unknown"} | Description: ${job.description}`
    ),
  ].join("\n");
}

function parseResult(rawText: string, jobs: AIJob[]): AIMatchResult {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid AI response format.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<AIMatchResult>;
  const recommendedReferenceModule = parsed.recommendedReferenceModule?.trim();
  const whyItFitsYourProfile = parsed.whyItFitsYourProfile?.trim();
  const howToContribute = parsed.howToContribute?.trim();

  if (!recommendedReferenceModule || !whyItFitsYourProfile || !howToContribute) {
    throw new Error("Incomplete AI response.");
  }

  const matchedJob = jobs.find((job) => job.title === recommendedReferenceModule);
  if (!matchedJob) {
    throw new Error("AI selected an unknown module.");
  }

  return {
    recommendedReferenceModule: matchedJob.title,
    whyItFitsYourProfile,
    howToContribute,
  };
}

function getModelCandidates() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();

  return [
    configuredModel,
    DEFAULT_GEMINI_MODEL,
    ...FALLBACK_GEMINI_MODELS,
  ].filter((model, index, models): model is string => {
    if (!model) {
      return false;
    }

    return models.indexOf(model) === index;
  });
}

function isModelNotFoundError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /404|not found|not supported/i.test(error.message);
}

function isRetryableModelError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /429|503|unavailable|high demand|overloaded|timeout/i.test(error.message);
}

function sleep(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function toUserFacingError(error: unknown, modelCandidates: string[]) {
  if (isRetryableModelError(error)) {
    return new Error(
      "Gemini is temporarily busy. Please try again in a moment."
    );
  }

  if (isModelNotFoundError(error)) {
    return new Error(
      `No supported Gemini model is available for this API key. Tried: ${modelCandidates.join(", ")}.`
    );
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unable to get an AI recommendation right now.");
}

export async function askAI(userSkills: string, jobs: AIJob[]) {
  const normalizedSkills = userSkills.trim();

  if (!normalizedSkills) {
    throw new Error("Please enter your skills before asking AI.");
  }

  if (!jobs.length) {
    throw new Error("No jobs are available for matching right now.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = buildPrompt(normalizedSkills, jobs);
  const modelCandidates = getModelCandidates();
  let lastError: unknown;

  for (const modelName of modelCandidates) {
    const model = client.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
      try {
        const response = await model.generateContent(prompt);

        return parseResult(response.response.text(), jobs);
      } catch (error) {
        lastError = error;

        if (isModelNotFoundError(error)) {
          break;
        }

        if (!isRetryableModelError(error)) {
          throw error;
        }

        if (attempt === MAX_RETRY_ATTEMPTS) {
          break;
        }

        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw toUserFacingError(lastError, modelCandidates);
}
