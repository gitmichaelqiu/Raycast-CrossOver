import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { listBottles } from "./utils";
import { useEffect, useState } from "react";
import { join, basename } from "path";
import { copyFile, mkdir, readdir, writeFile, readFile, access } from "fs/promises";

interface FormValues {
  bottle: string;
  folder: string;
}

async function moveFolderRecursive(src: string, dest: string) {
  try {
    // Check if source exists and is accessible
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

async function addShortcutToBottle(bottlePath: string, programFolderName: string, exeName: string) {
  try {
    const cxmenuPath = join(bottlePath, "cxmenu.conf");
    let cxmenuContent = "";
    
    try {
      cxmenuContent = await readFile(cxmenuPath, "utf-8");
    } catch (error) {
      console.log(`Creating new cxmenu.conf file at ${cxmenuPath}`);
      cxmenuContent = "";
    }
    
    const shortcutSection = `[StartMenu.C^3A_users_crossover_AppData_Roaming_Microsoft_Windows_Start+Menu/${exeName}.lnk]`;
    const shortcutBlock = `${shortcutSection}
"Type" = "windows"
"Icon" = "${exeName}.0"
"Shortcut" = "${exeName}"
"Mode" = "install"
"Arch" = "x86_64"
`;
    
    if (!cxmenuContent.includes(shortcutSection)) {
      cxmenuContent += `\n${shortcutBlock}`;
      await writeFile(cxmenuPath, cxmenuContent, "utf-8");
      console.log(`Added shortcut for ${exeName} to ${cxmenuPath}`);
    } else {
      console.log(`Shortcut for ${exeName} already exists in ${cxmenuPath}`);
    }
  } catch (error) {
    throw new Error(`Failed to add shortcut: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default function Command() {
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
      
      // Check if the program folder exists
      try {
        await access(programFolder);
        console.log(`Program folder exists: ${programFolder}`);
      } catch (error) {
        throw new Error(`Program folder not found: ${programFolder}`);
      }

      // Show progress toast
      await showToast({
        style: Toast.Style.Animated,
        title: "Moving program...",
        message: `Moving ${basename(programFolder)} to ${bottle.name}`,
      });
      
      const programFolderName = basename(programFolder);
      const destDir = join(bottle.path, "drive_c", "Program Files", programFolderName);
      
      // Move the folder
      await moveFolderRecursive(programFolder, destDir);
      console.log(`Successfully moved folder to ${destDir}`);
      
      // Find the main executable
      const files = await readdir(destDir);
      console.log("Files in destination:", files);
      
      const exeName = files.find((f) => f.endsWith(".exe")) || programFolderName;
      console.log(`Using executable name: ${exeName}`);
      
      // Add shortcut
      await addShortcutToBottle(bottle.path, programFolderName, exeName);
      
      // Show success toast
      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Program moved to ${bottle.name} and shortcut added`,
      });
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