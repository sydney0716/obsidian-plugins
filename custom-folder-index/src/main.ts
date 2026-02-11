import {
	App,
	Plugin,
	TFile,
	TFolder,
	Notice,
	PluginSettingTab,
	Setting,
	TAbstractFile
} from "obsidian";
import { CustomFolderIndexSettings, DEFAULT_SETTINGS, CustomFolderIndexSettingTab } from "./settings";

export default class CustomFolderIndexPlugin extends Plugin {
	settings: CustomFolderIndexSettings;
	private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "create-custom-folder-index",
			name: "Create folder index (0_FolderName)",
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					const parent = activeFile.parent;
					if (parent) {
						await this.createFolderIndex(parent);
					}
				} else {
					new Notice("No active file.");
				}
			}
		});


		this.addCommand({
			id: "create-custom-folder-index-recursive",
			name: "Create folder index (Recursive)",
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					const parent = activeFile.parent;
					if (parent) {
						await this.createRecursiveFolderIndex(parent);
						new Notice(`Recursive index created for "${parent.name}"`);
					}
				} else {
					new Notice("No active file.");
				}
			}
		});

		this.addSettingTab(new CustomFolderIndexSettingTab(this.app, this));

		// Auto-update listeners
		this.registerEvent(this.app.vault.on('create', (file) => this.onFileChange(file)));
		this.registerEvent(this.app.vault.on('delete', (file) => this.onFileChange(file)));
		this.registerEvent(this.app.vault.on('rename', (file, oldPath) => this.onFileChange(file, oldPath)));

		// Context Menu
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder) {
					const isBlacklisted = this.isPathBlacklisted(file.path);

					menu.addItem((item) => {
						item
							.setTitle(isBlacklisted ? "Resume Indexing (Auto-update)" : "Stop Indexing (Blacklist)")
							.setIcon(isBlacklisted ? "play-circle" : "stop-circle")
							.onClick(async () => {
								if (isBlacklisted) {
									await this.removeFromBlacklist(file.path);
									new Notice(`Resumed indexing for "${file.name}"`);
									await this.createFolderIndex(file); // Update immediately
								} else {
									await this.addToBlacklist(file.path);
									new Notice(`Stopped indexing for "${file.name}"`);
								}
							});
					});

					menu.addItem((item) => {
						item
							.setTitle("Create folder index (Recursive)")
							.setIcon("folder-tree")
							.onClick(async () => {
								await this.createRecursiveFolderIndex(file);
								new Notice(`Recursive index created for "${file.name}"`);
							});
					});
				}
			})
		);
	}

	onunload() {
		for (const timeoutId of this.updateTimeouts.values()) {
			clearTimeout(timeoutId);
		}
		this.updateTimeouts.clear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onFileChange(file: TAbstractFile, oldPath?: string) {
		if (!this.settings.autoUpdate) return;

		// Loop guard: Ignore if the changed file IS the index file
		if (file instanceof TFile) {
			const parent = file.parent;
			if (parent) {
				const folderName = parent.name;
				let indexFileName = this.settings.indexFileName.replace('{folderName}', folderName);
				if (!indexFileName.endsWith('.md')) indexFileName += '.md';
				if (file.name === indexFileName) return;
			}
		}

		// If it's a rename, we might need to update the OLD folder too if it moved
		if (oldPath) {
			const oldParentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
			const oldParent = this.app.vault.getAbstractFileByPath(oldParentPath);
			if (oldParent instanceof TFolder) {
				this.scheduleUpdate(oldParent);
			}
		}

		// For deletion, file.parent might be null. Try to find parent by path.
		let parent = file.parent;
		if (!parent) {
			const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
			const p = this.app.vault.getAbstractFileByPath(parentPath);
			if (p instanceof TFolder) parent = p;
		}

		if (parent) {
			this.scheduleUpdate(parent);
		}
	}

	scheduleUpdate(folder: TFolder) {
		// Clear existing timeout
		if (this.updateTimeouts.has(folder.path)) {
			clearTimeout(this.updateTimeouts.get(folder.path));
		}

		// Set new timeout (2 seconds)
		const timeoutId = setTimeout(async () => {
			await this.checkAndUpdateIndex(folder);
			this.updateTimeouts.delete(folder.path);
		}, 2000);

		this.updateTimeouts.set(folder.path, timeoutId);
	}

	async checkAndUpdateIndex(folder: TFolder) {
		// Recursive blacklist check
		if (this.isPathBlacklisted(folder.path)) return;

		const folderName = folder.name;
		let indexFileName = this.settings.indexFileName.replace('{folderName}', folderName);
		if (!indexFileName.endsWith('.md')) indexFileName += '.md';
		const indexFilePath = `${folder.path}/${indexFileName}`;

		// Only update if index exists
		const existing = this.app.vault.getAbstractFileByPath(indexFilePath);
		if (existing instanceof TFile) {
			await this.createFolderIndex(folder);
		}
	}

	isPathBlacklisted(path: string): boolean {
		const blacklist = this.settings.blacklist.split('\n').filter(s => s.trim().length > 0);
		return blacklist.some(entry => {
			if (entry.endsWith('/*') || entry.endsWith('/.')) {
				// Recursive blacklist
				const cleanParams = entry.replace(/\/\*$/, '').replace(/\/\.$/, '');
				return path === cleanParams || path.startsWith(cleanParams + '/');
			} else {
				// Strict blacklist
				return path === entry;
			}
		});
	}

	async addToBlacklist(path: string) {
		const current = this.settings.blacklist.split('\n').filter(s => s.trim().length > 0);
		// Default to recursive blacklist for context menu
		const recursivePath = path + '/*';
		if (!current.includes(recursivePath) && !current.includes(path)) {
			current.push(recursivePath);
			this.settings.blacklist = current.join('\n');
			await this.saveSettings();
		}
	}

	async removeFromBlacklist(path: string) {
		const current = this.settings.blacklist.split('\n').filter(s => s.trim().length > 0);
		// Remove both strict and recursive variations
		const newBlacklist = current.filter(p => p !== path && p !== path + '/*' && p !== path + '/.');
		this.settings.blacklist = newBlacklist.join('\n');
		await this.saveSettings();
	}

	async createFolderIndex(folder: TFolder) {
		if (this.isPathBlacklisted(folder.path)) {
			return;
		}

		const folderName = folder.name;
		let indexFileName = this.settings.indexFileName.replace('{folderName}', folderName);
		if (!indexFileName.endsWith('.md')) {
			indexFileName += '.md';
		}
		const indexFilePath = `${folder.path}/${indexFileName}`;

		const files = folder.children
			.filter(
				(f): f is TFile =>
					f instanceof TFile &&
					f.extension === "md" &&
					f.name !== indexFileName
			)
			.sort((a, b) => a.basename.localeCompare(b.basename));

		const subfolders = folder.children
			.filter((f): f is TFolder => f instanceof TFolder)
			.sort((a, b) => a.name.localeCompare(b.name));

		// Check if markers are already in the template
		const templateHasFilesMarkers = this.settings.template.includes('<!-- start:files -->');
		const templateHasSubfoldersMarkers = this.settings.template.includes('<!-- start:subfolders -->');

		// Wrap content in markers only if template doesn't have them
		const filesContent = templateHasFilesMarkers
			? files.map(f => `### [[${f.basename}]]`).join("\n")
			: `<!-- start:files -->\n` + files.map(f => `### [[${f.basename}]]`).join("\n") + `\n<!-- end:files -->`;

		const subfoldersContent = templateHasSubfoldersMarkers
			? subfolders.map(f => `### [[${f.name}]]`).join("\n")
			: `<!-- start:subfolders -->\n` + subfolders.map(f => `### [[${f.name}]]`).join("\n") + `\n<!-- end:subfolders -->`;

		// If there are no files, check if we should index subdirectories only
		if (files.length === 0 && !this.settings.indexSubdirOnly) {
			return;
		}

		let existing = this.app.vault.getAbstractFileByPath(indexFilePath);

		try {
			if (existing instanceof TFile) {
				let currentContent = await this.app.vault.read(existing);
				let newContent = currentContent;
				let hasChanges = false;

				// Helper to replace content between markers
				const replaceBetweenMarkers = (content: string, startMarker: string, endMarker: string, newText: string): string => {
					const startIndex = content.indexOf(startMarker);
					const endIndex = content.indexOf(endMarker);

					if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
						// Markers found, replace content between them
						const before = content.substring(0, startIndex);
						const after = content.substring(endIndex + endMarker.length);
						return before + newText + after;
					} else {
						// Markers not found, return original content
						return content;
					}
				};

				// Check if markers exist for files
				if (currentContent.includes('<!-- start:files -->') && currentContent.includes('<!-- end:files -->')) {
					const updatedContent = replaceBetweenMarkers(newContent, '<!-- start:files -->', '<!-- end:files -->', filesContent);
					if (updatedContent !== newContent) {
						newContent = updatedContent;
						hasChanges = true;
					}
				} else {
					// Fallback: If no markers, likely an old file or manually created. 
					// We could try to replace the template variable if it's there, but practically, 
					// strict marker replacement is safer to avoid overwriting user content accidentally.
					// However, if we don't overwrite, the markers will never get added.
					// DECISION: If markers are missing, we check if the file matches the TEMPLATE structure approximately? 
					// EASIER: If markers are missing, we treat it as a "Full update" (overwrite) to inject markers,
					// BUT only if it looks like an auto-generated file (e.g. strict match of previous content logic).
					// OR simply overwrite it this one time to upgrade it. 
					// Let's stick to the generated content logic for full rewrite if markers are missing.
					// This means the FIRST update will be destructive (resetting to template), which is acceptable for "adopting" the new format.
					const fullGeneratedContent = this.settings.template
						.replace('{folderName}', folderName)
						.replace('{files}', filesContent)
						.replace('{subfolders}', subfoldersContent);

					if (currentContent !== fullGeneratedContent) {
						newContent = fullGeneratedContent;
						hasChanges = true;
					}
				}

				// Check if markers exist for subfolders (independently)
				if (currentContent.includes('<!-- start:subfolders -->') && currentContent.includes('<!-- end:subfolders -->')) {
					const updatedContent = replaceBetweenMarkers(newContent, '<!-- start:subfolders -->', '<!-- end:subfolders -->', subfoldersContent);
					if (updatedContent !== newContent) {
						newContent = updatedContent;
						hasChanges = true;
					}
				}

				if (hasChanges) {
					await this.app.vault.modify(existing, newContent);
				}
			} else {
				// New file: Use template and inject markers
				const content = this.settings.template
					.replace('{folderName}', folderName)
					.replace('{files}', filesContent)
					.replace('{subfolders}', subfoldersContent);

				await this.app.vault.create(indexFilePath, content);
			}
		} catch (e: any) {
			console.error(e);
			new Notice(`Failed to create index: ${e.message}`);
		}
	}

	async createRecursiveFolderIndex(folder: TFolder) {
		await this.createFolderIndex(folder);

		for (const child of folder.children) {
			if (child instanceof TFolder) {
				await this.createRecursiveFolderIndex(child);
			}
		}
	}
}