import { Form, ActionPanel, Action, showToast, Toast, useNavigation, Clipboard } from "@raycast/api";
import { listBottles } from "./utils";
import { useEffect, useState } from "react";
import { join, basename } from "path";
import { copyFile, mkdir, readdir, access } from "fs/promises";

interface FormValues {
  bottle: string;
  folder: string;
}

async function findMainExecutable(dir: string): Promise<{ name: string; path: string } | null> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const exeFiles = entries.filter(entry => 
      entry.isFile() && entry.name.toLowerCase().endsWith('.exe')
    );

    if (exeFiles.length === 0) {
      return null;
    }

    const exeFile = exeFiles[0];
    return {
      name: exeFile.name,
      path: join(dir, exeFile.name)
    };
  } catch (error) {
    console.error("Error finding executable:", error);
    return null;
  }
}

async function moveFolderRecursive(src: string, dest: string) {
  try {
    await access(src);
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    
    if (entries.length === 0) {
      throw new Error(`Source folder is empty: ${src}`);
    }
    
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      if (entry.isDirectory()) {
        await moveFolderRecursive(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to move folder: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default function Command() {
  const { pop } = useNavigation();
  const [bottles, setBottles] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBottles() {
      try {
        const bottleList = await listBottles();
        console.log("Found bottles:", bottleList);
        setBottles(bottleList.map((b) => ({ name: b.name, path: b.path })));
      } catch (error) {
        console.error("Error loading bottles:", error);
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load bottles",
          message: String(error),
        });
      } finally {
        setLoading(false);
      }
    }
    loadBottles();
  }, []);

  async function handleSubmit(values: FormValues) {
    try {
      if (!values.bottle) {
        throw new Error("Please select a bottle");
      }
      if (!values.folder) {
        throw new Error("Please enter a program folder path");
      }

      const bottle = bottles.find((b) => b.name === values.bottle);
      if (!bottle) {
        throw new Error(`Bottle "${values.bottle}" not found`);
      }

      const programFolder = values.folder;
      
      try {
        await access(programFolder);
        console.log(`Program folder exists: ${programFolder}`);
      } catch (error) {
        throw new Error(`Program folder not found: ${programFolder}`);
      }

      await showToast({
        style: Toast.Style.Animated,
        title: "Moving program...",
        message: `Moving ${basename(programFolder)} to ${bottle.name}`,
      });
      
      const programFolderName = basename(programFolder);
      const destDir = join(bottle.path, "drive_c", "Program Files", programFolderName);
      
      await moveFolderRecursive(programFolder, destDir);
      console.log(`Successfully moved folder to ${destDir}`);
      
      const exeInfo = await findMainExecutable(destDir);
      if (!exeInfo) {
        throw new Error("No executable file found in the program folder");
      }
      
      console.log("Found executable:", exeInfo);
      
      // Copy the command path to clipboard
      const commandPath = `"${exeInfo.path}"`;
      await Clipboard.copy(commandPath);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Program moved and command path copied to clipboard",
      });
      
      // Close the window after successful execution
      pop();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to move program",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Move Program" 
            onSubmit={handleSubmit}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown 
        id="bottle" 
        title="Bottle" 
        storeValue
      >
        {bottles.map((b) => (
          <Form.Dropdown.Item 
            key={b.name} 
            value={b.name} 
            title={b.name}
          />
        ))}
      </Form.Dropdown>
      
      <Form.TextField 
        id="folder" 
        title="Program Folder Path" 
        placeholder="/path/to/program/folder"
      />
    </Form>
  );
} 