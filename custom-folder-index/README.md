# Custom Folder Index for Obsidian

This plugin for [Obsidian](https://obsidian.md) allows you to automatically generate and maintain index notes for your folders. It keeps track of files and subfolders, ensuring your folder notes are always up-to-date.

## Features

- **Automatic Indexing**: Generates an index file containing links to all files and subfolders within a directory.
- **Recursive Support**: Can generate indexes for a folder and all its subfolders in one go.
- **Auto-Update**: Automatically updates index files when you create, rename, or delete files in a folder (if enabled).
- **Customizable Templates**: Define exactly how your index note should look using placeholders like `{folderName}`, `{files}`, and `{subfolders}`.
- **Blacklist System**: Exclude specific folders or entire subtrees from being indexed via the context menu or settings.

## How to Use

### Creating an Index
1. Right-click on any folder in your file explorer.
2. Select **Create folder index (Recursive)** to generate indexes for that folder and all subfolders.
3. Alternatively, use the command palette (`Cmd/Ctrl + P`) and search for "Create folder index".

### Managing Updates
- **Auto-Update**: By default, the plugin will watch for changes and update your index files automatically.
- **Stop Indexing**: Right-click a folder and select **Stop Indexing (Blacklist)** to prevent the plugin from touching that folder. You can resume it anytime by selecting **Resume Indexing**.

## Settings

- **Index Filename**: Define the naming convention for your index files (e.g., `0_{folderName}`).
- **Template**: Customize the content of the index file.
  - `{folderName}`: The name of the current folder.
  - `{files}`: A list of links to files in the folder.
  - `{subfolders}`: A list of links to subfolders.
- **Blacklist**: Manually manage the list of excluded paths.

## Installation

Since this plugin is currently a personal project:
1. Copy the `custom-folder-index` folder to your vault's `.obsidian/plugins/` directory.
2. Reload Obsidian.
3. Enable "Custom Folder Index" in Community Plugins.
