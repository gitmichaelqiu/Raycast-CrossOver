import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { Bottle, listBottles, openBottle } from "./utils";

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
            { text: bottle.modified ? "Running" : "Not running" }
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Open Bottle"
                onAction={async () => {
                  try {
                    await openBottle(bottle.path);
                    await showToast({
                      style: Toast.Style.Success,
                      title: "Bottle opened",
                      message: bottle.name,
                    });
                  } catch (error) {
                    await showToast({
                      style: Toast.Style.Failure,
                      title: "Failed to open bottle",
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