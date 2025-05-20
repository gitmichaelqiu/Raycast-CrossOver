import React from "react";
import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { listBottles, Bottle, closeBottle, focusBottle } from "./utils";
import { useEffect, useState } from "react";

export default function Command() {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBottles() {
      try {
        const bottleList = await listBottles();
        setBottles(bottleList);
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to list bottles",
          message: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBottles();
  }, []);

  return (
    <List isLoading={isLoading}>
      {bottles.map((bottle) => (
        <List.Item
          key={bottle.path}
          title={bottle.name}
          subtitle={bottle.path}
          accessories={[
            { text: bottle.modified ? "Modified" : "Unmodified" }
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Focus Bottle"
                onAction={async () => {
                  try {
                    await focusBottle(bottle.name);
                    await showToast({
                      style: Toast.Style.Success,
                      title: "Focused bottle",
                      message: bottle.name,
                    });
                  } catch (error) {
                    await showToast({
                      style: Toast.Style.Failure,
                      title: "Failed to focus bottle",
                      message: String(error),
                    });
                  }
                }}
              />
              <Action
                title="Close Bottle"
                onAction={async () => {
                  try {
                    await closeBottle(bottle.name);
                    setBottles(bottles.filter((b) => b.path !== bottle.path));
                    await showToast({
                      style: Toast.Style.Success,
                      title: "Closed bottle",
                      message: bottle.name,
                    });
                  } catch (error) {
                    await showToast({
                      style: Toast.Style.Failure,
                      title: "Failed to close bottle",
                      message: String(error),
                    });
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