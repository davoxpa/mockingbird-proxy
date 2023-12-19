const { ipcRenderer } = require('electron');

function selectDirectory() {
    ipcRenderer.send('firstSetWorkingDirPath');
}
ipcRenderer.on('responseFirstSetWorkingDirPath', (event, data) => {
    console.log('responseSelectDirectory js', data);
    document.querySelector('.success').innerHTML = data;
    setTimeout(() => {
        document.querySelector('.success').innerHTML = '';
    }, 3000);
});

ipcRenderer.on('errorFirstSetWorkingDirPath', (event, data) => {
    console.log('errorFirstSetWorkingDirPath js', data);
    document.querySelector('.error').innerHTML = 'Errore nella scrittura della cartella: ' + data;
    setTimeout(() => {
        document.querySelector('.error').innerHTML = '';
    }, 3000);
});
