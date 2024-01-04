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
const data = {
  "bypassCache": false,
  "method": "GET",
  "payload": {},
  "targetUrl": "",
  "response": {},
  "statusCode": 200,
  "timestamp": new Date().getTime()
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    openEditor(data);
});

function goHome() {
   ipcRenderer.send('goHome');
}

function createNewMock() {
    jsonUpdated = editor.get();
    // check data 
    if (!jsonUpdated.targetUrl) {
        alert('targetUrl is required');
        return;
    }
    jsonUpdated.uuid = '';
    console.log('jsonUpdated', jsonUpdated);
    ipcRenderer.send('createNewMock', jsonUpdated);
}
ipcRenderer.on('responseCreateNewMock', (event, data) => {
    console.log('responseSaveMock js', data);
    goHome();
});
