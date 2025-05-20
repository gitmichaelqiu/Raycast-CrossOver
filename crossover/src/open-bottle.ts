import { open } from "@raycast/api";
import { openBottle } from "./utils";

export default async function Command() {
  try {
    const selectedFile = await open({
      prompt: "Select a CrossOver bottle file",
      type: ["public.data"],
    });

    if (selectedFile) {
      await openBottle(selectedFile);
    }
  } catch (error) {
    console.error("Failed to open bottle:", error);
  }
} 