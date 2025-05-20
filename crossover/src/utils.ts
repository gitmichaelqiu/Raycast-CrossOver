import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface Bottle {
  name: string;
  path: string;
  modified: boolean;
}

export async function runAppleScript(script: string): Promise<string> {
  const { stdout } = await execAsync(`osascript -e '${script}'`);
  return stdout.trim();
}

export async function listBottles(): Promise<Bottle[]> {
  const script = `
    tell application "CrossOver"
      set bottleList to {}
      repeat with doc in documents
        set end of bottleList to {name:name of doc, path:path of doc, modified:modified of doc}
      end repeat
      return bottleList
    end tell
  `;
  
  const result = await runAppleScript(script);
  // Parse the AppleScript result into Bottle objects
  // Note: This is a simplified parser, might need adjustment based on actual output format
  const bottles: Bottle[] = [];
  const lines = result.split(", ");
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      bottles.push({
        name: lines[i].replace("name:", ""),
        path: lines[i + 1].replace("path:", ""),
        modified: lines[i + 2].replace("modified:", "") === "true"
      });
    }
  }
  return bottles;
}

export async function openBottle(path: string): Promise<void> {
  const script = `
    tell application "CrossOver"
      open "${path}"
    end tell
  `;
  await runAppleScript(script);
}

export async function closeBottle(name: string): Promise<void> {
  const script = `
    tell application "CrossOver"
      close document "${name}" saving yes
    end tell
  `;
  await runAppleScript(script);
}

export async function quitCrossOver(): Promise<void> {
  const script = `
    tell application "CrossOver"
      quit saving yes
    end tell
  `;
  await runAppleScript(script);
}

export async function focusBottle(name: string): Promise<void> {
  const script = `
    tell application "CrossOver"
      set frontmost of window "${name}" to true
    end tell
  `;
  await runAppleScript(script);
} 