import React from "react";
import { List, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import { listBottles, Bottle, focusBottle } from "./utils";
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
                title="Open Bottle Directory"
                shortcut={{ modifiers: ["cmd"], key: "return" }}
                onAction={() => open(bottle.path)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
} 