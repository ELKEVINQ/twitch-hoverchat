import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'electron-updater';

const { autoUpdater } = pkg;

// Definimos __filename y __dirname para que estén disponibles
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(app.getPath('userData'), 'config.json');

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config));
}

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        return {
            channel: "",
            service: "twitch" // valor por defecto
        };
        ; // Valor por defecto si no hay configuración
    }
}

let config = loadConfig();
let configWindow, chatWindow; // Guardamos las referencias de las ventanas

function createConfigWindow() {
    configWindow = new BrowserWindow({
        width: 320,
        height: 250,
        resizable: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'config-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    configWindow.loadFile('config.html');

    configWindow.webContents.on('did-finish-load', () => {
        configWindow.setSize(320, 250);
        configWindow.center();
        configWindow.setMaximumSize(320, 250);
        configWindow.setMinimumSize(320, 250);
        configWindow.webContents.send('load-channel', config.channel);
    });

    ipcMain.once('save-channel', (event, data) => {
        const { channel, service } = data;

        config.channel = channel;
        config.service = service;

        saveConfig(config);
        configWindow.close();
        createChatWindow();
    });


    ipcMain.on('close-config-window', () => {
        configWindow.close();
    });

    configWindow.on('closed', () => {
        configWindow = null;
    });
}

function createChatWindow() {
    chatWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true // 🔥 NECESARIO PARA KICK
        }
    });

    chatWindow.loadURL('data:text/html;charset=utf-8,<html><body></body></html>');
    chatWindow.setAlwaysOnTop(true);

    chatWindow.webContents.on('did-finish-load', () => {
        chatWindow.webContents.send('load-channel', {
            channel: config.channel,
            service: config.service
        });
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

function createSettingsWindow() {
    const settingsWindow = new BrowserWindow({
        width: 400,
        height: 500,
        title: 'Configuración',
        resizable: false, // Desactiva la opción de maximizar
        frame: true, // Mantiene los botones de cerrar y minimizar
        webPreferences: {
            preload: path.join(__dirname, 'settings-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    settingsWindow.setMenuBarVisibility(false); // Oculta el menú de la ventana

    settingsWindow.loadFile('settings.html');
}

// Evento para abrir la ventana de configuración cuando se recibe el mensaje desde el renderizador
ipcMain.on('open-settings', () => {
    console.log('Evento open-settings recibido'); // Verifica si el evento es capturado
    createSettingsWindow();
});

ipcMain.on('update-settings', (event, settings) => {
    if (chatWindow) {
        chatWindow.setOpacity(settings.transparency / 100); // Aplica transparencia
        chatWindow.webContents.send('update-background-color', settings.backgroundColor); // Cambia el color de fondo
    }
});

// Evento para manejar actualizaciones
autoUpdater.on('updateAvailable', () => {
    console.log('Update available');
});

autoUpdater.on('updateDownloaded', () => {
    autoUpdater.quitAndInstall(); // Reiniciar y aplicar la actualización
});

app.whenReady().then(() => {
    createConfigWindow();
    autoUpdater.checkForUpdates(); // Buscar actualizaciones al iniciar la aplicación
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createConfigWindow();
    }
});
