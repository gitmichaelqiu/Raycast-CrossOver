import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function Command() {
  try {
    // Check if CrossOver is running
    const { stdout: isRunning } = await execAsync("pgrep -x CrossOver");
    
    if (isRunning) {
      // Quit CrossOver
      await execAsync("pkill -x CrossOver");
      // Wait a moment for CrossOver to fully quit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Start CrossOver
    await execAsync("open -a CrossOver");

    await showToast({
      style: Toast.Style.Success,
      title: "CrossOver restarted",
      message: "The application has been restarted successfully",
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to restart CrossOver",
      message: String(error),
    });
  }
} 