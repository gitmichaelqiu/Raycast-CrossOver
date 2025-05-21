/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-all-bottles` command */
  export type ListAllBottles = ExtensionPreferences & {}
  /** Preferences accessible in the `copy-program-to-bottle` command */
  export type CopyProgramToBottle = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-all-bottles` command */
  export type ListAllBottles = {}
  /** Arguments passed to the `copy-program-to-bottle` command */
  export type CopyProgramToBottle = {}
}

