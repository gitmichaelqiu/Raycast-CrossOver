import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function Command() {
  try {
    // Check if CrossOver is running
    let isRunning = false;
    try {
      const { stdout } = await execAsync("pgrep -x CrossOver");
      isRunning = stdout.trim().length > 0;
    } catch (error) {
      // pgrep returns non-zero when no process is found, which is expected
      isRunning = false;
    }
    
    if (isRunning) {
      // Quit CrossOver if it's running
      await execAsync("pkill -x CrossOver");
      // Wait a moment for CrossOver to fully quit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Start CrossOver
    await execAsync("open -a CrossOver");

    await showToast({
      style: Toast.Style.Success,
      title: isRunning ? "CrossOver restarted" : "CrossOver launched",
      message: isRunning ? "The application has been restarted successfully" : "The application has been launched successfully",
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to launch CrossOver",
      message: String(error),
    });
  }
} 