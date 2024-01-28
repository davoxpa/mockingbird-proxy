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
    listHideFields.forEach((element) => {
        delete data[element];
    });
    return data;
};

const addHideFields = (data) => {
    listHideFields.forEach((element) => {
        data[element] = saveHideFields[element];
    });
    return data;
};

const data = {
    uuid: '',
    bypassCache: false,
    method: 'GET',
    payload: {},
    targetUrl: '',
    response: {},
    statusCode: 200,
    timestamp: new Date().getTime(),
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    openEditor(data);
});

function goHome() {
    ipcRenderer.send('goHome');
}

function createNewMock() {
    jsonUpdated = window.editor.get();
    // check data
    if (!jsonUpdated.targetUrl) {
        alert('targetUrl is required');
        return;
    }
    const recoveryData = addHideFields(jsonUpdated);
    console.log('jsonUpdated', recoveryData);
    ipcRenderer.send('createNewMock', recoveryData);
}
ipcRenderer.on('responseCreateNewMock', (event, data) => {
    console.log('responseSaveMock js', data);
    goHome();
});
