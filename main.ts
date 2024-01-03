import { Notice, Plugin, TFile, TFolder } from 'obsidian';

export default class PromoteNotePlugin extends Plugin {

	async onload() {		
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFile && file.extension == "md") {
					menu.addItem((item) => {
						item
							.setTitle("Promote Note to Folder")
							.setIcon("folder")
							.onClick(async () => this.promoteNote(file));
					});
				}
			})
		)
	}

	onunload() {

	}

	async promoteNote(file: TFile) {

		// Check if we have embeds, so we need to move them too
		const fileCache = this.app.metadataCache.getFileCache(file);
		const hasEmbeds = (fileCache && fileCache.embeds)

		// Extract the base name without the .md extension
		const baseName = file.basename;

		let newFolderPath: string;
		// Construct the path for the new folder
		if (file.parent) {
			newFolderPath = file.parent.path + '/' + baseName;
		} else {
			newFolderPath = baseName;
		}

		// Create the new folder
		await this.app.vault.createFolder(newFolderPath);

		// Construct the new path for the file
		const newFilePath = newFolderPath + '/' + file.name;

		let attachmentsFolderPath = "";
		if (hasEmbeds) {
			// we must get the attachment folder before moving
			attachmentsFolderPath = await this.getAvailablePathForAttachments("", "", file);
		}

		// Move the file to the new folder
		await this.app.fileManager.renameFile(file, newFilePath);

		if (hasEmbeds) {
			const newFile = this.app.vault.getAbstractFileByPath(newFilePath);
			if (newFile instanceof TFile) {
				await this.moveLinkedFiles(file, attachmentsFolderPath, newFile);
			}
			new Notice(`${newFilePath}  created and images moved`);

			if (await this.deleteIfEmpty(attachmentsFolderPath)) {
				new Notice(`${attachmentsFolderPath}  folder deleted`);
			}
		} else {
			new Notice(`${newFilePath}  created`);
		}

	}

	async moveLinkedFiles(oldFile: TFile, attachmentsFolderPath: string, newFile: TFile) {
		// Retrieve the file cache for the note
		const fileCache = this.app.metadataCache.getFileCache(oldFile);
		const newAttachmentsFolderPath = await this.getAvailablePathForAttachments("", "", newFile);
		// Check if there are any links in the file cache
		if (fileCache && fileCache.embeds) {
			for (const embed of fileCache.embeds) {
				// Construct the full path of the embedded file
				const embedFile = this.app.metadataCache.getFirstLinkpathDest(embed.link, oldFile.path);
				if (embedFile instanceof TFile) {
					const embedFilePath = embedFile.path;

					// Check if the file is an image and in the 'images' subfolder
					if (embedFilePath.startsWith(attachmentsFolderPath)) {
						const newImageFilePath = `${newAttachmentsFolderPath}${embedFile.name}`;
						// Move the image file to the new folder
						await this.app.fileManager.renameFile(embedFile, newImageFilePath);
					}
				}
			}
		}
	}

	async deleteIfEmpty(folderPath: string): Promise<boolean> {
		// Get the folder object
		if (folderPath.endsWith('/')) {
			folderPath = folderPath.slice(0, -1);
		}
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		// Make sure it's a folder and not a file
		if (folder instanceof TFolder) {
			// Get the contents of the folder
			const contents = folder.children;

			// If the folder is empty (no files or subfolders)
			if (contents.length === 0) {
				// Delete the folder
				await this.app.vault.trash(folder, true);
				return true;
			}
		}

		return false;
	}

	/**
	 * This is a helper method for an undocumented API of Obsidian.
	 *
	 * @param fileName The Filename for your Attachment
	 * @param format The Fileformat of your Attachment
	 * @param sourceFile The Sourcefile from where the Attachment gets added, this is needed because the Attachment Folder might be different based on where it gets inserted.
	 * @returns The Attachment Path
	 */
	async getAvailablePathForAttachments(
		fileName: string,
		format: string,
		sourceFile: TFile
	): Promise<string> {
		//@ts-expect-error
		return this.app.vault.getAvailablePathForAttachments(fileName, format, sourceFile);
	}

}


