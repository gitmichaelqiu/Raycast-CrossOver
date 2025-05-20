import { showToast, Toast } from "@raycast/api";
import { quitCrossOver } from "./utils";

export default async function Command() {
  try {
    await quitCrossOver();
    await showToast({
      style: Toast.Style.Success,
      title: "Quit CrossOver",
      message: "CrossOver has been quit successfully",
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to quit CrossOver",
      message: String(error),
    });
  }
} 