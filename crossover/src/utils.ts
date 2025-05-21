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
  windowsVersion?: string;
}

export type GraphicsBackend = "Auto" | "D3DMetal" | "DXMT" | "DXVK" | "Wine";
export type SyncMode = "Default" | "ESync" | "MSync";

export async function listBottles(): Promise<Bottle[]> {
  const bottlesDir = join(homedir(), "Library/Application Support/CrossOver/Bottles");
  console.log("Scanning bottles directory:", bottlesDir);
  
  try {
    const entries = await readdir(bottlesDir, { withFileTypes: true });
    console.log("Found entries:", entries.map(e => e.name));
    
    const bottles = await Promise.all(entries
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const bottlePath = join(bottlesDir, entry.name);
        const configPath = join(bottlePath, "cxbottle.conf");
        
        let windowsVersion: string | undefined;
        try {
          const configContent = await readFile(configPath, 'utf-8');
          const match = configContent.match(/"WindowsVersion"\s*=\s*"([^"]*)"/);
          if (match) {
            windowsVersion = match[1];
          }
        } catch (error) {
          console.error(`Error reading config for ${entry.name}:`, error);
        }

        return {
          name: entry.name,
          path: bottlePath,
          modified: false,
          windowsVersion
        };
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

export async function changeSyncMode(bottlePath: string, mode: SyncMode): Promise<void> {
  const configPath = join(bottlePath, "cxbottle.conf");
  
  try {
    // Read the current configuration
    const configContent = await readFile(configPath, 'utf-8');
    
    // Map the sync mode to its configuration values
    const syncValues = {
      "Default": { WINEESYNC: "0", WINEMSYNC: "0" },
      "ESync": { WINEESYNC: "1", WINEMSYNC: "0" },
      "MSync": { WINEESYNC: "0", WINEMSYNC: "1" }
    }[mode];

    // Check if the EnvironmentVariables section exists
    if (!configContent.includes("[EnvironmentVariables]")) {
      throw new Error("Configuration file is missing the EnvironmentVariables section");
    }

    // Update or add the sync settings
    let newConfig = configContent;
    
    // Update WINEESYNC
    if (configContent.includes('"WINEESYNC"')) {
      newConfig = newConfig.replace(
        /"WINEESYNC"\s*=\s*"[^"]*"/,
        `"WINEESYNC" = "${syncValues.WINEESYNC}"`
      );
    } else {
      newConfig = newConfig.replace(
        /\[EnvironmentVariables\]/,
        `[EnvironmentVariables]\n"WINEESYNC" = "${syncValues.WINEESYNC}"`
      );
    }

    // Update WINEMSYNC
    if (configContent.includes('"WINEMSYNC"')) {
      newConfig = newConfig.replace(
        /"WINEMSYNC"\s*=\s*"[^"]*"/,
        `"WINEMSYNC" = "${syncValues.WINEMSYNC}"`
      );
    } else {
      newConfig = newConfig.replace(
        /\[EnvironmentVariables\]/,
        `[EnvironmentVariables]\n"WINEMSYNC" = "${syncValues.WINEMSYNC}"`
      );
    }

    // Write the updated configuration
    await writeFile(configPath, newConfig, 'utf-8');
  } catch (error) {
    console.error("Error changing sync mode:", error);
    throw error;
  }
}
