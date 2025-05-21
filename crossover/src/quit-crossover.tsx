import { showToast, Toast } from "@raycast/api";
import { runAppleScript } from "./utils";

export default async function Command() {
  try {
    await runAppleScript('tell application "CrossOver" to quit');
    await showToast({
      style: Toast.Style.Success,
      title: "CrossOver quit",
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to quit CrossOver",
      message: String(error),
    });
  }
} 