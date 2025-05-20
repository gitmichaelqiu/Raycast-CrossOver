import { showToast, Toast, open } from "@raycast/api";
import { openBottle } from "./utils";

export default async function Command() {
  try {
    const selectedFile = await open({
      prompt: "Select a CrossOver bottle file",
      type: ["public.data"],
    });

    if (selectedFile) {
      await openBottle(selectedFile);
      await showToast({
        style: Toast.Style.Success,
        title: "Opened bottle",
        message: selectedFile,
      });
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to open bottle",
      message: String(error),
    });
  }
} 