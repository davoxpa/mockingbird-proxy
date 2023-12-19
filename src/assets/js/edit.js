const { ipcRenderer } = require('electron');
console.log('edit.js');

let editor = null; // Variabile globale per mantenere l'editor
let jsonUpdated = null; // Variabile globale per mantenere il json aggiornato

function openEditor(data) {
    const options = {};
    const container = document.getElementById('jsoneditor');

    // Pulisce il contenitore se l'editor esiste già
    if (editor) {
        editor.destroy();
    }

    // Crea una nuova istanza dell'editor
    editor = new JSONEditor(container, options);
    editor.set(data);
}

ipcRenderer.on('responseEditMock', (event, data) => {
    console.log('responseEditMock js', data);
    openEditor(data);
});

function writeLocalStorage(name, value) {
    localStorage.setItem(name, value);
}

function goHome() {
   ipcRenderer.send('goHome');
}

function saveMock() {
    jsonUpdated = editor.get();
    console.log('jsonUpdated', jsonUpdated);
    ipcRenderer.send('saveMock', jsonUpdated);
}
ipcRenderer.on('responseSaveMock', (event, data) => {
    console.log('responseSaveMock js', data);
    goHome();
});
