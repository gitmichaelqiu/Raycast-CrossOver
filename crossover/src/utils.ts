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
      try
        set bottleList to {}
        
        -- Try to get bottles through different methods
        try
          -- Method 1: Direct document access
          set docList to every document
          repeat with doc in docList
            set bottleName to name of doc
            set bottlePath to path of doc
            set bottleModified to modified of doc
            set end of bottleList to {name:bottleName, path:bottlePath, modified:bottleModified}
          end repeat
        end try
        
        -- If no bottles found, try alternative methods
        if bottleList is {} then
          -- Method 2: Try to get bottles through windows
          set winList to every window
          repeat with win in winList
            set bottleName to name of win
            set bottlePath to path of win
            set bottleModified to modified of win
            set end of bottleList to {name:bottleName, path:bottlePath, modified:bottleModified}
          end repeat
        end if
        
        -- If still no bottles, try to get the Windows 10 bottle directly
        if bottleList is {} then
          try
            set win10Bottle to document "Windows 10"
            set end of bottleList to {name:"Windows 10", path:path of win10Bottle, modified:modified of win10Bottle}
          end try
        end if
        
        -- Debug output
        log "Found bottles: " & bottleList
        
        return bottleList
      on error errMsg
        return "Error: " & errMsg
      end try
    end tell
  `;
  
  try {
    const result = await runAppleScript(script);
    console.log("Raw AppleScript result:", result); // Debug log

    // Handle error message
    if (result.startsWith("Error:")) {
      throw new Error(result);
    }

    // Handle empty result
    if (!result || result === "") {
      console.log("No bottles found or empty result");
      return [];
    }

    // Parse the AppleScript result into Bottle objects
    const bottles: Bottle[] = [];
    const lines = result.split(", ");
    console.log("Split lines:", lines); // Debug log

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].replace("name:", "").trim();
        const path = lines[i + 1].replace("path:", "").trim();
        const modified = lines[i + 2].replace("modified:", "").trim() === "true";

        console.log("Parsed bottle:", { name, path, modified }); // Debug log

        bottles.push({
          name,
          path,
          modified
        });
      }
    }

    return bottles;
  } catch (error) {
    console.error("Error in listBottles:", error);
    throw error;
  }
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

export async function focusBottle(name: string): Promise<void> {
  const script = `
    tell application "CrossOver"
      set frontmost of window "${name}" to true
    end tell
  `;
  await runAppleScript(script);
} 