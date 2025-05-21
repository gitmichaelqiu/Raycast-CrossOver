import { exec } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
import { readdir } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

export interface Bottle {
  name: string;
  path: string;
  modified: boolean;
}

export async function listBottles(): Promise<Bottle[]> {
  const bottlesDir = join(homedir(), "Library/Application Support/CrossOver/Bottles");
  console.log("Scanning bottles directory:", bottlesDir);
  
  try {
    const entries = await readdir(bottlesDir, { withFileTypes: true });
    console.log("Found entries:", entries.map(e => e.name));
    
    const bottles = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        path: join(bottlesDir, entry.name),
        modified: false // We'll keep this for future use if needed
      }));
    
    console.log("Found bottles:", bottles);
    return bottles;
  } catch (error) {
    console.error("Error listing bottles:", error);
    throw error;
  }
}

export async function openBottle(path: string): Promise<void> {
  const script = `tell application "CrossOver" to open "${path}"`;
  await runAppleScript(script);
}

export async function closeBottle(name: string): Promise<void> {
  const script = `
    tell application "System Events"
      tell process "CrossOver"
        set frontmost to true
        click button 1 of window "${name}"
      end tell
    end tell
  `;
  await runAppleScript(script);
}

export async function focusBottle(name: string): Promise<void> {
  const script = `
    tell application "System Events"
      tell process "CrossOver"
        set frontmost to true
        set frontmost of window "${name}" to true
      end tell
    end tell
  `;
  await runAppleScript(script);
} 