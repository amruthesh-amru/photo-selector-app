const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile('index.html');
});

// Folder selection
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
});

// Load files
ipcMain.handle('load-files', async (_, folderPath) => {
    try {
        return fs.readdirSync(folderPath);
    } catch (err) {
        console.error('Error reading folder:', err);
        return [];
    }
});

// Save selected photos
ipcMain.handle('save-selected-photos', async (_, folderPath, selectedPhotos) => {
    const destinationFolder = path.join(folderPath, 'selected-photos');

    try {
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder);
        }

        selectedPhotos.forEach((file) => {
            const source = path.join(folderPath, file);
            const destination = path.join(destinationFolder, file);
            fs.copyFileSync(source, destination);
        });

        return { success: true, savedFolder: destinationFolder };
    } catch (err) {
        console.error('Error saving photos:', err);
        return { success: false };
    }
});
