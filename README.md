# Obsidian Note Promote plugin

Very simple plugin that converts a note to a folder with a folder note. This is useful if you decide to expand the original note with other files and you need to create a container to avoid cluttering original folder. 

If the original note has embedded images, these images are moved too. It checks Obsidian settings.

# Warnings

This is my first plugin and the initial code was even generated using ChatGPT, so anything can happen.
I've tested it only on my structure which stores attachments in a subfolder of current folder (named for example images).

# Use

## Settings
No settings are currently available

## Promoting a note
- Rigth-click on a note in file navigator
- Select **Promote Note to Folder**
- Plugin executes:
  - creates a subfolder with the same name
  - checks if there are any embedded images in the note
  - moves the note
  - moves the images
  - moves the original attachment folder to trash if it's empty

