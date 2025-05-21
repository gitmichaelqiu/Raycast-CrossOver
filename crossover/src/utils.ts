import { exec } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
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
    // Read CrossOver defaults
    const { stdout } = await execAsync('defaults read com.codeweavers.CrossOver MostRecentCXFBMenuPlist');
    
    // Parse the output to find bottle names
    const bottleNames: string[] = [];
    const lines = stdout.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Description = ')) {
        const name = line.substring('Description = '.length).replace(/[";]/g, '').trim();
        if (name) {
          bottleNames.push(name);
        }
      }
    }

    // Create bottle objects
    const bottles: Bottle[] = bottleNames.map(name => ({
      name,
      path: join(homedir(), "Library/Application Support/CrossOver/Bottles", name),
      modified: false
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