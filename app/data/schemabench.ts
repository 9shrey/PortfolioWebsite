/** Mode-support probe from data/results/probe.json in the schemabench repo:
 *  per model, did it honour [tool_call, strict]? prompt_only has no mechanism
 *  to honour and is drawn as n/a. 1 = honoured, 0 = inconclusive. */
export const SCHEMA_PROBE: { model: string; tool: 0 | 1; strict: 0 | 1 }[] = [
  { model: "dots-3-note-preview", tool: 0, strict: 1 },
  { model: "gemma-4-26b-a4b", tool: 0, strict: 0 },
  { model: "gemma-4-31b", tool: 0, strict: 0 },
  { model: "lfm-2.5-2.6b", tool: 1, strict: 1 },
  { model: "nex-n2.5-pro", tool: 1, strict: 1 },
  { model: "nemotron-3-super-120b", tool: 1, strict: 1 },
  { model: "nemotron-3.5-lightning", tool: 1, strict: 1 },
  { model: "inkling", tool: 0, strict: 0 },
];
