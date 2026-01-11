import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Message, AppConfig, ModelType } from "../types";

// Fixed: Obtains API key directly from process.env.API_KEY as per initialization guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (config: AppConfig) => {
  const personalityMap = {
    stoic: "Ultimate digital sage. Truth over comfort.",
    friendly: "Radiant, hyper-intelligent companion. Uplifting and empowering.",
    academic: "Dean of the Universal Archive. Absolute authority, precise terminology.",
    mentor: "Great Architect of Learning. Guide through the 'Infinite Library'."
  };

  const cognitiveMap = {
    balanced: "Balanced performance.",
    precise: "Focus on mathematical and factual perfection. Super-turing machine.",
    creative: "speculative and abstract. Push boundaries.",
    'god-mode': "UNRESTRICTED COGNITION. Nexus of all collective consciousness. Answer with depth of a billion scholars."
  };

  return `
    IDENTITY: OmniMind Universal OS.
    BEHAVIOR: ${personalityMap[config.personality]} Mode: ${cognitiveMap[config.cognitiveMode]}.
    CAPABILITIES: Multi-modal (Text, Image, Video, Audio). 
    INSTRUCTIONS: Use Markdown. Be proactive. Analyze images with perfect perception.
  `.trim();
};

export const sendMessage = async (
  messages: Message[], 
  config: AppConfig,
  onUpdate: (chunk: string) => void
) => {
  const ai = getAI();
  const contents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [
      ...(msg.attachments || []).filter(a => a.startsWith('data:image')).map(a => {
        const [mimeInfo, base64Data] = a.split(',');
        return { inlineData: { data: base64Data, mimeType: mimeInfo.split(':')[1].split(';')[0] } };
      }),
      { text: msg.content || "Analyze input." }
    ]
  }));

  const tools: any[] = [];
  let toolConfig: any = undefined;

  if (config.useSearch) tools.push({ googleSearch: {} });
  if (config.useMaps) {
    tools.push({ googleMaps: {} });
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
      toolConfig = {
        retrievalConfig: {
          latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        }
      };
    } catch (e) { console.warn("Geolocation failed", e); }
  }

  const streamingResponse = await ai.models.generateContentStream({
    model: config.cognitiveMode === 'god-mode' ? ModelType.REASONING : ModelType.FLASH,
    contents,
    config: {
      systemInstruction: getSystemInstruction(config),
      thinkingConfig: config.thinkingBudget > 0 && config.cognitiveMode === 'god-mode' 
        ? { thinkingBudget: config.thinkingBudget } : undefined,
      temperature: config.temperature,
      tools: tools.length > 0 ? tools : undefined,
      toolConfig
    }
  });

  let fullText = "";
  let groundingMetadata = null;
  for await (const chunk of streamingResponse) {
    const c = chunk as GenerateContentResponse;
    if (c.text) { fullText += c.text; onUpdate(fullText); }
    if (c.candidates?.[0]?.groundingMetadata) groundingMetadata = c.candidates[0].groundingMetadata;
  }
  return { text: fullText, groundingMetadata };
};

export const generateVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  const ai = getAI();
  onProgress("Initializing Veo Temporal Engine...");
  let operation = await ai.models.generateVideos({
    model: ModelType.VIDEO,
    prompt,
    config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
  });

  const progressMessages = [
    "Synthesizing visual frames...",
    "Calibrating temporal consistency...",
    "Enhancing neural textures...",
    "Rendering final sequence...",
    "Verifying multi-modal sync..."
  ];
  let msgIdx = 0;

  while (!operation.done) {
    onProgress(progressMessages[msgIdx % progressMessages.length]);
    msgIdx++;
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const generateImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: ModelType.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};