import { List, ActionPanel, Action, showToast, Toast, confirmAlert, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { Bottle, listBottles, runAppleScript } from "./utils";
import { exec } from "child_process";
import { promisify } from "util";
import { rm } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const execAsync = promisify(exec);

export default function Command() {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Starting to fetch bottles...");
    listBottles()
      .then((bottleList) => {
        console.log("Bottles fetched:", bottleList);
        setBottles(bottleList);
      })
      .catch((error) => {
        console.error("Error fetching bottles:", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to list bottles",
          message: String(error),
        });
      })
      .finally(() => {
        console.log("Finished fetching bottles");
        setIsLoading(false);
      });
  }, []);

  async function removeBottle(bottle: Bottle) {
    console.log("Starting to remove bottle:", bottle.name);
    try {
      // Remove the bottle directory
      await rm(join(bottle.path), { recursive: true, force: true });
      console.log("Bottle directory removed");

      // Update the list
      setBottles(bottles.filter(b => b.path !== bottle.path));

      await showToast({
        style: Toast.Style.Success,
        title: "Bottle removed",
        message: `${bottle.name} has been removed`,
      });
    } catch (error) {
      console.error("Error removing bottle:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to remove bottle",
        message: String(error),
      });
    }
  }

  return (
    <List isLoading={isLoading}>
      {bottles.map((bottle) => (
        <List.Item
          key={bottle.path}
          title={bottle.name}
          subtitle={bottle.path}
          accessories={[
            { text: bottle.modified ? "Running" : "Not running" }
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Remove Bottle"
                icon={Icon.Trash}
                onAction={async () => {
                  if (await confirmAlert({
                    title: "Remove Bottle",
                    message: `Are you sure you want to remove "${bottle.name}"? This action cannot be undone.`,
                    primaryAction: {
                      title: "Remove",
                    },
                  })) {
                    await removeBottle(bottle);
                  }
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
} 