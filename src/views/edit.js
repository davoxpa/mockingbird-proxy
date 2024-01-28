const { ipcRenderer } = require('electron');
console.log('edit.js');

let editor = null; // Variabile globale per mantenere l'editor
let jsonUpdated = null; // Variabile globale per mantenere il json aggiornato
let saveHideFields = {};
let listHideFields = ['uuid', 'bypassCache', 'timestamp'];

function openEditor(data) {
    const container = document.getElementById('jsoneditor');
    const options = {
        modes: ['code', 'tree'],
    };

    // Pulisce il contenitore se l'editor esiste già
    if (window.editor) {
        window.editor.destroy();
    }

    // Crea una nuova istanza dell'editor
    window.editor = new JSONEditor(container, options);

    // Imposta i dati nell'editor
    const cleanData = removeHideFields(data);
    window.editor.set(cleanData);
}

const removeHideFields = (data) => {
    // archive hide fields
    listHideFields.forEach((element) => {
        saveHideFields[element] = data[element];
    });
    listHideFields.forEach((element) => {
        delete data[element];
    });
    return data;
}

const addHideFields = (data) => {
    listHideFields.forEach((element) => {
        data[element] = saveHideFields[element];
    });
    return data;
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
    jsonUpdated = window.editor.get();
    const recoveryData = addHideFields(jsonUpdated);
    console.log('jsonUpdated', recoveryData);
    ipcRenderer.send('saveMock', recoveryData);
}
ipcRenderer.on('responseSaveMock', (event, data) => {
    console.log('responseSaveMock js', data);
    goHome();
});
