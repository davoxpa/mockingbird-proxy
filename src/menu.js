const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

const menuTemplate = [
    ...(process.platform === 'darwin'
        ? [
              {
                  label: app.getName(),
                  submenu: [
                      { role: 'about' },
                      { type: 'separator' },
                      { role: 'services' },
                      { type: 'separator' },
                      { role: 'hide' },
                      { role: 'hideOthers' },
                      { role: 'unhide' },
                      { type: 'separator' },
                      { role: 'quit' },
                  ],
              },
          ]
        : []),
    {
        label: 'File',
        submenu: [
            {
                label: 'open workspace',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    ipcMain.emit('goToConfig');
                },
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    console.log('Save File');
                },
            },
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    console.log('Open File');
                },
            },
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click() {
                    app.quit();
                },
            },
        ],
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                click() {
                    console.log('Undo');
                },
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                click() {
                    console.log('Redo');
                },
            },
            {
                type: 'separator',
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                click() {
                    console.log('Cut');
                },
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                click() {
                    console.log('Copy');
                },
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                click() {
                    console.log('Paste');
                },
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                click() {
                    console.log('Select All');
                },
            },
        ],
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload();
                },
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
                },
            },
        ],
    },
    {
        label: 'Window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize',
            },
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close',
            },
        ],
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Learn More',
                click() {
                    require('electron').shell.openExternal('https://github.com/davoxpa/mockingbird-proxy');
                },
            },
        ],
    },
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
