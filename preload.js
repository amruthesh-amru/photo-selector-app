const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    loadFiles: (folderPath) => ipcRenderer.invoke('load-files', folderPath),
    saveSelectedPhotos: (folderPath, selectedPhotos) =>
        ipcRenderer.invoke('save-selected-photos', folderPath, selectedPhotos),
});
