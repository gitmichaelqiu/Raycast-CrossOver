import { exec } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
import { readdir, stat } from "fs/promises";
import { join } from "path";

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
  try {
    // Get the bottles directory path
    const bottlesDir = join(homedir(), "Library/Application Support/CrossOver/Bottles");
    
    // Read the bottles directory
    const items = await readdir(bottlesDir);
    
    // Filter out non-directory items
    const bottleNames = await Promise.all(
      items.map(async (name) => {
        const fullPath = join(bottlesDir, name);
        const stats = await stat(fullPath);
        return stats.isDirectory() ? name : null;
      })
    );
    
    // Remove null values and log found bottles
    const validBottleNames = bottleNames.filter((name): name is string => name !== null);
    console.log("Found bottles:", validBottleNames);

    // Convert to Bottle objects
    const bottles: Bottle[] = validBottleNames.map(name => ({
      name,
      path: join(bottlesDir, name),
      modified: false // We'll need to check this separately
    }));

    // Check which bottles are currently running using AppleScript
    const script = `
      tell application "System Events"
        tell process "CrossOver"
          set winList to every window
          set runningBottles to {}
          repeat with win in winList
            set winName to name of win
            if winName is not "CrossOver" then
              set end of runningBottles to winName
            end if
          end repeat
          return runningBottles
        end tell
      end tell
    `;

    try {
      const runningBottles = await runAppleScript(script);
      const runningBottleNames = runningBottles.split(", ").map(name => name.trim());
      
      // Update the modified status for running bottles
      bottles.forEach(bottle => {
        bottle.modified = runningBottleNames.includes(bottle.name);
      });
    } catch (error) {
      console.error("Error getting running bottles:", error);
    }

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