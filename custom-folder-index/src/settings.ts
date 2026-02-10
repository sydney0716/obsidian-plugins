import { App, PluginSettingTab, Setting } from "obsidian";
import CustomFolderIndexPlugin from "./main";

export interface CustomFolderIndexSettings {
	template: string;
	blacklist: string;
	indexFileName: string;
	autoUpdate: boolean;
	indexSubdirOnly: boolean;
}

export const DEFAULT_SETTINGS: CustomFolderIndexSettings = {
	template: `
***
# {folderName}

## Files
{files}
`,
	blacklist: '',
	indexFileName: '0_{folderName}.md',
	autoUpdate: false,
	indexSubdirOnly: false
}

export class CustomFolderIndexSettingTab extends PluginSettingTab {
	plugin: CustomFolderIndexPlugin;

	constructor(app: App, plugin: CustomFolderIndexPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable Automatic Updates')
			.setDesc('Automatically update index files when notes are created, deleted, or renamed.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoUpdate)
				.onChange(async (value) => {
					this.plugin.settings.autoUpdate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Index folders with only subdirectories')
			.setDesc('If enabled, creates an index even if the folder contains only subdirectories and no other files. Default is off.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.indexSubdirOnly)
				.onChange(async (value) => {
					this.plugin.settings.indexSubdirOnly = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Index Filename Pattern')
			.setDesc('The name of the index file. Use {folderName} as a placeholder.')
			.addText(text => text
				.setPlaceholder('0_{folderName}.md')
				.setValue(this.plugin.settings.indexFileName)
				.onChange(async (value) => {
					this.plugin.settings.indexFileName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Blacklist')
			.setDesc('List of folder paths to exclude, one per line. Use "Folder/*" to exclude subfolders.')
			.addTextArea(text => {
				text
					.setPlaceholder('Folder/Subfolder\nAnotherFolder/*')
					.setValue(this.plugin.settings.blacklist)
					.onChange(async (value) => {
						this.plugin.settings.blacklist = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 10;
			});

		new Setting(containerEl)
			.setName('Index Template')
			.setDesc('Template for the index file content. Use {folderName} for the folder name and {files} for the list of files.')
			.addTextArea(text => {
				text
					.setValue(this.plugin.settings.template)
					.onChange(async (value) => {
						this.plugin.settings.template = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 10;
			});
	}
}
