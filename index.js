const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const configPath = path.join(app.getPath('userData'), 'config.json');

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config));
}

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        return { channel: "" }; // Valor por defecto si no hay configuración
    }
}

let config = loadConfig();

function createConfigWindow() {
    let configWindow = new BrowserWindow({
        width: 320,           // Ancho exacto para el contenido
        height: 250,          // Altura exacta para el contenido
        resizable: false,     // Deshabilitar redimensionamiento
        frame: false,         // Sin barra de herramientas
        webPreferences: {
            preload: path.join(__dirname, 'config-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    configWindow.loadFile('config.html');

    configWindow.webContents.on('did-finish-load', () => {
        configWindow.setSize(320, 250); // Ajuste exacto al contenido después de cargar
        configWindow.center();          // Centrar la ventana en la pantalla
        configWindow.setMaximumSize(320, 250); // Establecer tamaño máximo
        configWindow.setMinimumSize(320, 250); // Establecer tamaño mínimo
        configWindow.webContents.send('load-channel', config.channel);
    });

    ipcMain.once('save-channel', (event, channel) => {
        config.channel = channel;
        saveConfig(config);
        configWindow.close();
        createChatWindow(); // Abrir ventana del chat después de guardar el canal
    });

    ipcMain.on('close-config-window', () => {
        configWindow.close();
    });

    configWindow.on('closed', () => {
        configWindow = null;
    });
}

function createChatWindow() {
    let chatWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    chatWindow.loadURL('data:text/html;charset=utf-8,<html><body></body></html>');
    chatWindow.setAlwaysOnTop(true);

    chatWindow.webContents.on('did-finish-load', () => {
        chatWindow.webContents.send('load-channel', config.channel);
    });

    ipcMain.on('close-window', () => {
        chatWindow.close();
    });

    chatWindow.on('focus', () => {
        chatWindow.setIgnoreMouseEvents(false);
        chatWindow.webContents.send('show-titlebar');
    });

    chatWindow.on('blur', () => {
        chatWindow.setIgnoreMouseEvents(true, { forward: true });
        chatWindow.webContents.send('hide-titlebar');
    });

    chatWindow.on('closed', () => {
        chatWindow = null;
        ipcMain.removeAllListeners('close-window');
    });
}

app.whenReady().then(createConfigWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createConfigWindow();
    }
});
