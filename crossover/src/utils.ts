import { exec } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

export interface Bottle {
  name: string;
  path: string;
  modified: boolean;
}

export type GraphicsBackend = "Auto" | "D3DMetal" | "DXMT" | "DXVK" | "Wine";

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

export async function changeGraphicsBackend(bottlePath: string, backend: GraphicsBackend): Promise<void> {
  const configPath = join(bottlePath, "cxbottle.conf");
  
  try {
    // Read the current configuration
    const configContent = await readFile(configPath, 'utf-8');
    
    // Map the backend to its configuration value
    const backendValue = {
      "Auto": "",
      "D3DMetal": "d3dmetal",
      "DXMT": "dxmt",
      "DXVK": "dxvk",
      "Wine": "wined3d"
    }[backend];

    // Check if the EnvironmentVariables section exists
    if (!configContent.includes("[EnvironmentVariables]")) {
      throw new Error("Configuration file is missing the EnvironmentVariables section");
    }

    // Update or add the CX_GRAPHICS_BACKEND setting
    let newConfig = configContent;
    if (configContent.includes('"CX_GRAPHICS_BACKEND"')) {
      // Replace existing setting
      newConfig = configContent.replace(
        /"CX_GRAPHICS_BACKEND"\s*=\s*"[^"]*"/,
        `"CX_GRAPHICS_BACKEND" = "${backendValue}"`
      );
    } else {
      // Add new setting before the closing bracket
      newConfig = configContent.replace(
        /\[EnvironmentVariables\]/,
        `[EnvironmentVariables]\n"CX_GRAPHICS_BACKEND" = "${backendValue}"`
      );
    }

    // Write the updated configuration
    await writeFile(configPath, newConfig, 'utf-8');
  } catch (error) {
    console.error("Error changing graphics backend:", error);
    throw error;
  }
}
