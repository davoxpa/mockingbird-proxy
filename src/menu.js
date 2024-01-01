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
                label: 'Select Workspace',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    ipcMain.emit('goToConfig');
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
                label: 'Maximize',
                accelerator: 'CmdOrCtrl+Shift+M',
                role: 'maximize',
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
                label: 'Github Mockingbird Proxy',
                click() {
                    require('electron').shell.openExternal('https://github.com/davoxpa/mockingbird-proxy');
                },
            },
        ],
    },
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
