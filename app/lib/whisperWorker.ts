/// <reference lib="webworker" />

// Runs entirely in a Web Worker so model download + inference never blocks
// the main thread. Loaded via `new Worker(new URL(...), { type: "module" })`
// from VoiceMic.tsx.
import { pipeline, type AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";

const MODEL_ID = "Xenova/whisper-tiny.en";

let transcriberPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

function getTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline("automatic-speech-recognition", MODEL_ID, {
      progress_callback: (progress: unknown) => {
        self.postMessage({ type: "progress", progress });
      },
    }) as Promise<AutomaticSpeechRecognitionPipeline>;
  }
  return transcriberPromise;
}

self.onmessage = async (event: MessageEvent) => {
  const { type } = event.data ?? {};

  if (type === "load") {
    try {
      await getTranscriber();
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "error", message: (err as Error).message });
    }
    return;
  }

  if (type === "transcribe") {
    const audio = event.data.audio as Float32Array;
    try {
      const transcriber = await getTranscriber();
      const output = await transcriber(audio);
      const text = Array.isArray(output) ? output[0]?.text : output.text;
      self.postMessage({ type: "result", text: text ?? "" });
    } catch (err) {
      self.postMessage({ type: "error", message: (err as Error).message });
    }
  }
};
