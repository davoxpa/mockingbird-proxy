const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static-electron');
ffmpeg.setFfmpegPath(ffmpegPath);

const Store = require('electron-store');

const path = require('path');
const { getAllMock, deleteMock, getMock, saveMock, startMockManager } = require('../web-server/mockManager');
// const express = require('./server'); // Importa il file server.js
const {startServer, stopServer, checkStatusServer} = require('../web-server/server');

let mainWindow;
let dirPath;

let store = new Store();
store.clear();
function createWindow() {
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, './assets/logo/mocking-bird-proxy-logo-1024.icns'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.maximize();

    if (store.get('dirPath')) {
        dirPath = store.get('dirPath');
    }
    console.log('dirPath', dirPath)
    if (dirPath && dirPath.length > 0) {
        mainWindow.loadFile(path.join(__dirname, './views/index.html'));
    } else {
        mainWindow.loadFile(path.join(__dirname, './views/config.html'));
        // dirPath = dialog.showOpenDialog({ properties: ['openDirectory'] });
        // store.set('dirPath', dirPath);
    }
    // mainWindow.loadFile(path.join(__dirname, './views/index.html'));

    // Aprire gli strumenti di sviluppo automaticamente
    // mainWindow.webContents.openDevTools();

    // mainWindow.loadURL('http://localhost:3000/manager'); // Carica il server Express
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow()
});

// app.on('ready', () => {
//     store = new Store();
//     console.log('ready')

//     dirPath = dialog.showOpenDialog({ properties: ['openDirectory'] });
//     store.set('dirPath', dirPath);
// });

ipcMain.on('firstSetWorkingDirPath', async (event) => {
    try {
        const dirSelected = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        dirPath = dirSelected.filePaths[0];
        // try to write a dir to working
        fs.access(dirPath, fs.constants.W_OK, (err) => {
            if (err) {
                console.error('Errore nella scrittura della cartella:', err);
                event.sender.send('errorFirstSetWorkingDirPath', err);
                return;
            }
            store.set('dirPath', dirPath);
            console.log('requestDirPath', dirPath)
            event.sender.send('responseFirstSetWorkingDirPath', dirPath);
            setTimeout(() => {
                console.log('setTimeout')
                mainWindow.loadFile(path.join(__dirname, './views/index.html'));
            }, 2000);
        });
    } catch (error) {
        console.error('Errore:', error);
    }
});


// ipc section
ipcMain.on('goHome', (event) => {
    console.log('goHome')
    mainWindow.loadFile(path.join(__dirname, './views/index.html'));
    event.sender.send('responseGoHome');
});

ipcMain.on('requestFilesList', (event) => {
    startMockManager();
    event.sender.send('responseFilesList', getAllMock());
});

ipcMain.on('deleteMock', (event, filename) => {
    console.log('delete', filename)
    deleteMock(filename);
    event.sender.send('responseDeleteMock', filename);
});

ipcMain.on('startServer', (event, port) => {
    console.log('electron startServer', port)
    startServer(port);
    event.sender.send('responseStartServer', port);
});

ipcMain.on('stopServer', (event) => {
    console.log('electron stopServer')
    stopServer();
    event.sender.send('responseStopServer');
});

ipcMain.on('editMock', (event, filename) => {
    mainWindow.loadFile(path.join(__dirname, './views/edit.html'));
    // event.sender.send('responseEditMock', getMock(filename));
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('responseEditMock', getMock(filename));
    });
    console.log('editMock:', getMock(filename));
});

ipcMain.on('saveMock', (event, mock) => {
    console.log('saveMock', mock)
    saveMock(mock.uuid, mock);
    event.sender.send('responseSaveMock', mock);
});

ipcMain.on('checkServerRunning', (event)=>{
    console.log('checkServerRunning', checkStatusServer())
    event.sender.send('responseCheckServerRunning', checkStatusServer());
})
