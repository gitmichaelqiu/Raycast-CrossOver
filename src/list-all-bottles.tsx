import React from "react";
import { List, ActionPanel, Action, showToast, Toast, confirmAlert, Icon, open, Color } from "@raycast/api";
import { listBottles, Bottle, changeGraphicsBackend, GraphicsBackend, changeSyncMode, SyncMode } from "./utils";
import { useEffect, useState } from "react";
import { rm } from "fs/promises";
import { join } from "path";

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

  async function removeBottle(bottle: Bottle) {
    try {
      // Remove the bottle directory
      await rm(join(bottle.path), { recursive: true, force: true });

      // Update the list
      setBottles(bottles.filter(b => b.path !== bottle.path));

      await showToast({
        style: Toast.Style.Success,
        title: "Bottle removed",
        message: `${bottle.name} has been removed`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to remove bottle",
        message: String(error),
      });
    }
  }

  async function handleGraphicsBackendChange(bottle: Bottle, backend: GraphicsBackend) {
    try {
      await changeGraphicsBackend(bottle.path, backend);
      await showToast({
        style: Toast.Style.Success,
        title: "Graphics backend changed",
        message: `Changed to ${backend} for ${bottle.name}`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to change graphics backend",
        message: String(error),
      });
    }
  }

  async function handleSyncModeChange(bottle: Bottle, mode: SyncMode) {
    try {
      await changeSyncMode(bottle.path, mode);
      await showToast({
        style: Toast.Style.Success,
        title: "Synchronization changed",
        message: `Changed to ${mode} for ${bottle.name}`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to change synchronization",
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
            { text: bottle.windowsVersion || "Unknown Windows Version" }
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Open Bottle Directory"
                icon={Icon.Folder}
                shortcut={{ modifiers: ["cmd"], key: "return" }}
                onAction={() => open(bottle.path)}
              />
              <ActionPanel.Submenu
                title="Change Graphics Backend"
                icon={Icon.Monitor}
                shortcut={{ modifiers: ["cmd"], key: "g" }}
              >
                <Action
                  title="Auto"
                  onAction={() => handleGraphicsBackendChange(bottle, "Auto")}
                />
                <Action
                  title="D3DMetal"
                  onAction={() => handleGraphicsBackendChange(bottle, "D3DMetal")}
                />
                <Action
                  title="DXMT"
                  onAction={() => handleGraphicsBackendChange(bottle, "DXMT")}
                />
                <Action
                  title="DXVK"
                  onAction={() => handleGraphicsBackendChange(bottle, "DXVK")}
                />
                <Action
                  title="Wine"
                  onAction={() => handleGraphicsBackendChange(bottle, "Wine")}
                />
              </ActionPanel.Submenu>
              <ActionPanel.Submenu
                title="Change Synchronization"
                icon={Icon.ArrowClockwise}
                shortcut={{ modifiers: ["cmd"], key: "s" }}
              >
                <Action
                  title="Default"
                  onAction={() => handleSyncModeChange(bottle, "Default")}
                />
                <Action
                  title="ESync"
                  onAction={() => handleSyncModeChange(bottle, "ESync")}
                />
                <Action
                  title="MSync"
                  onAction={() => handleSyncModeChange(bottle, "MSync")}
                />
              </ActionPanel.Submenu>
              <Action
                title="Remove Bottle"
                icon={Icon.Trash}
                shortcut={{ modifiers: ["ctrl"], key: "x" }}
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