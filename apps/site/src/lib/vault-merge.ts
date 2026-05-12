import { getEphemeral } from "./ephemeral-provider";
import { getVaultHandle, isBlind } from "./privacy-hub";

export async function mergeEphemeralIntoVault(ephemeralId: string): Promise<void> {
  if (isBlind()) {
    throw new Error("Vault is locked — reconnect storage before merging.");
  }
  const root = getVaultHandle();
  if (!root) {
    throw new Error("Pick a vault folder first.");
  }
  const blob = getEphemeral(ephemeralId);
  if (!blob) {
    throw new Error("That provider snapshot expired or was already cleared.");
  }
  const fileHandle = await root.getFileHandle("prv-provider-merge.jsonl", { create: true });
  const file = await fileHandle.getFile();
  const writable = await fileHandle.createWritable({ keepExistingData: true });
  await writable.seek(file.size);
  let parsed: unknown;
  try {
    parsed = JSON.parse(blob.body) as unknown;
  } catch {
    parsed = { rawText: blob.body };
  }
  const line = JSON.stringify({
    mergedAt: new Date().toISOString(),
    sourceLabel: blob.label,
    payload: parsed
  });
  await writable.write(`${line}\n`);
  await writable.close();
}
