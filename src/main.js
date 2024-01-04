const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');
const StoreManager = require('./storeManager');
const storeManager = StoreManager.getInstance();

// dipendenza per ffmpeg che serve anche se si vuole fare un app portable
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static-electron');
ffmpeg.setFfmpegPath(ffmpegPath);

const isDev =
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath);

if (isDev) {
    console.log('In modalità Sviluppo');
} else {
    console.log('In modalità Produzione');
}

// menu app 
require('./menu');

// gestione mock
const { getAllMock, deleteMock, deleteAllMock, getMock, saveMock, startMockManager, changeValueOnMock, filterMock, createMock } = require('./app-proxy-server/mockManager');

// gestione server 
const {startServer, stopServer, checkStatusServer} = require('./app-proxy-server/server');

let mainWindow;
let dirPath;

// init store per l'archiviazione dei dati
let store = new Store();

function createWindow() {
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, './assets/logo/mocking-bird-proxy-logo-1024.icns'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile(path.join(__dirname, './views/config.html'));
    mainWindow.maximize();

    // Aprire gli strumenti di sviluppo automaticamente
    if (isDev){
        mainWindow.webContents.openDevTools();
    }
    
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

ipcMain.on('getWorkingDirPath', (event) => {
    const historyStoreDirPath = storeManager.getConfig().historyStoreDirPath;
    mainWindow.webContents.send('responseGetWorkingDirPath', historyStoreDirPath);
});

ipcMain.on('selectDir', async (event) => {
    try {
        const dirSelected = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        dirPath = dirSelected.filePaths[0];
        // try to write a dir to working
        fs.access(dirPath, fs.constants.W_OK, (err) => {
            if (err) {
                console.error('Errore nella scrittura della cartella:', err);
                mainWindow.webContents.send('errorSelectDir', err);
                return;
            }
            storeManager.setSingleConfig('dirPath', dirPath);
            console.log('requestDirPath', dirPath)
            const historyStoreDirPath = storeManager.getConfig().historyStoreDirPath || [];
            const uniqueStoreDirPath = [...new Set([...historyStoreDirPath, dirPath])];
            storeManager.setSingleConfig('historyStoreDirPath', uniqueStoreDirPath);
            mainWindow.webContents.send('responseSelectDir', dirPath);
            setTimeout(() => {
                console.log('setTimeout')
                mainWindow.loadFile(path.join(__dirname, './views/index.html'));
            }, 1000);
        });
    } catch (error) {
        console.error('Errore:', error);
    }
});

ipcMain.on('searchMock', (event, search) => {
    console.log('searchMock', search)
    result = filterMock(search);
    mainWindow.webContents.send('responseSearchMock', result);
});

ipcMain.on('openHistoryDir', (event, dirPath) => {
    startMockManager();
    console.log('openHistoryDir', dirPath)
    storeManager.setSingleConfig('dirPath', dirPath);
    mainWindow.loadFile(path.join(__dirname, './views/index.html'));
});


// ipc section
ipcMain.on('goHome', (event) => {
    startMockManager();
    console.log('goHome')
    mainWindow.loadFile(path.join(__dirname, './views/index.html'));
    mainWindow.webContents.send('responseGoHome');
});

ipcMain.on('requestFilesList', (event) => {
    mainWindow.webContents.send('responseFilesList', getAllMock());
});

ipcMain.on('deleteMock', (event, filename) => {
    console.log('delete', filename)
    deleteMock(filename);
    mainWindow.webContents.send('responseDeleteMock', filename);
});

ipcMain.on('deleteAllMock', (event) => {
    console.log('deleteAllMock')
    deleteAllMock();
    mainWindow.webContents.send('responseDeleteAllMock');
});

ipcMain.on('startServer', (event, port) => {
    console.log('electron startServer', port)
    startServer(port);
    mainWindow.webContents.send('responseStartServer', port);
});

ipcMain.on('stopServer', (event) => {
    console.log('electron stopServer')
    stopServer();
    mainWindow.webContents.send('responseStopServer');
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
    mainWindow.webContents.send('responseSaveMock', mock);
});

ipcMain.on('checkServerRunning', (event)=>{
    mainWindow.webContents.send('responseCheckServerRunning', checkStatusServer());
})

ipcMain.on('goToConfig', (event)=>{
    stopServer();
    console.log('goToConfig')
    mainWindow.loadFile(path.join(__dirname, './views/config.html'));
    // event.sender.send('responseGoToConfig');
})

ipcMain.on('changeValueMock', (event, filename, key, value)=>{
    console.log('changeValueMock', filename, key, value)
    const result = changeValueOnMock(filename, key, value);
    if(result){
        mainWindow.webContents.send('responseChangeValueMockSuccess');
    }else{
        mainWindow.webContents.send('responseChangeValueMockFail');
    }
})

ipcMain.on('byPassGlobalChange', (event, value)=>{
    console.log('byPassGlobalChange', value)
    storeManager.setSingleConfig('bypassGlobal', value);
    mainWindow.webContents.send('responseByPassGlobalChange');
});

ipcMain.on('changeConfig', (event, key, value)=>{
    console.log('changeConfig', key, value)
    storeManager.setSingleConfig(key, value);
    mainWindow.webContents.send('responseChangeConfig');
});

ipcMain.on('getConfig', (event)=>{
    console.log('getConfig')
    mainWindow.webContents.send('responseGetConfig', storeManager.getConfig());
});

ipcMain.on('openPageCreateMock', (event)=>{
    console.log('openPageCreateMock')
    mainWindow.loadFile(path.join(__dirname, './views/create.html'));
});

ipcMain.on('createNewMock', (event, mock)=>{
    console.log('createNewMock', mock)
    createMock(mock);
    mainWindow.webContents.send('responseCreateNewMock');
});

