const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

window.addEventListener('load', () => {
    ipcRenderer.send('checkServerRunning');
    if (localStorage.getItem('port') == 'null' || localStorage.getItem('port') == 'undefined' || localStorage.getItem('port') == '') {
        localStorage.setItem('port', '3000');
        document.querySelector('#port').value = localStorage.getItem('port');
    }else if(!localStorage.getItem('port')){
        localStorage.setItem('port', '3000');
        document.querySelector('#port').value = localStorage.getItem('port');
    }else{
        document.querySelector('#port').value = localStorage.getItem('port');
    }
        
    document.querySelector('#port').addEventListener('keyup', (event) => {
        localStorage.setItem('port', event.target.value);
    });
});


ipcRenderer.on('responseCheckServerRunning', (event, status) => {
    console.log('responseCheckServerRunning', status);
    if (status) {
      changeUiToServerStart();
      document.querySelector('#port').value = localStorage.getItem('port');
    }else{
      changeUiToServerStop();
    }
});

ipcRenderer.on('responseFilesList', (event, files) => {
    console.log('File nella cartella:', files);
    let test = files.map((file) => file.targetUrl);
    console.log('test', test);
    // Qui puoi manipolare il DOM per mostrare i file...
    document.querySelector('.row-mock').innerHTML = '';
    files.forEach((file) => {
        // generateMockRow(file);
        const mockElement = createMockElement(file);
        document.querySelector('.row-mock').appendChild(mockElement);
    });
    
});

setInterval(() => {
  ipcRenderer.send('checkServerRunning');
  // ipcRenderer.send('requestFilesList');
}, 1000*5);
ipcRenderer.send('requestFilesList');

function deleteMock(filename) {
  console.log('file index delete', filename)
  ipcRenderer.send('deleteMock', filename);
}
ipcRenderer.on('responseDeleteMock', (event, filename) => {
  console.log('file index receive delete', filename)
  ipcRenderer.send('requestFilesList');
});

function editMock(uuid) {
  writeLocalStorage('uuid', uuid);
  ipcRenderer.send('editMock', uuid);
}
ipcRenderer.on('responseEditMock', (event, filename) => {
  // ipcRenderer.send('requestFilesList');
});

function startServer() {
  const port = document.querySelector('#port').value;
  ipcRenderer.send('startServer', port);
}
function changeUiToServerStart(){
  document.querySelector('#config').innerHTML = 'http://localhost:' + document.querySelector('#port').value + '/your-real-api-url.com/api/v1/...';
  document.querySelector('#port').disabled = true;
  // document.querySelector('#path').disabled = true;
  document.querySelector('#stop').classList.remove('d-none');
  document.querySelector('#play').classList.add('d-none');
  document.querySelector('.led').classList.add('led-on');
}
ipcRenderer.on('responseStartServer', (event, port) => {
  changeUiToServerStart();
  writeLocalStorage('port', port);
  console.log('responseStartServer', port);
});

function stopServer() {
  ipcRenderer.send('stopServer');
}
function changeUiToServerStop(){
  document.querySelector('#config').innerHTML = '';
  document.querySelector('#port').disabled = false;
  // document.querySelector('#path').disabled = false;
  document.querySelector('#play').classList.remove('d-none');
  document.querySelector('#stop').classList.add('d-none');
  document.querySelector('.led').classList.remove('led-on');
}
ipcRenderer.on('responseStopServer', (event) => {
  changeUiToServerStop();
  console.log('responseStopServer');
});

function writeLocalStorage(name, value) {
    localStorage.setItem(name, value);
}

function bypassChange(el) {
  console.log('bypassChange', el);
  const status = el.checked ? true : false;
  ipcRenderer.send('changeValueMock', el.dataset.uuid, 'bypassCache', status);
}

function createMockElement({method, targetUrl, uuid, bypassCache}) {
    // Crea il contenitore principale
    const container = document.createElement('div');
    container.className = 'col-12';

    // Crea e aggiungi il paragrafo per il metodo
    const methodP = document.createElement('p');
    methodP.className = 'method';
    methodP.classList.add(`method-${method.toLowerCase()}`);
    methodP.textContent = method;
    container.appendChild(methodP);

    // Crea e aggiungi il paragrafo per l'URL target
    const targetUrlP = document.createElement('p');
    targetUrlP.className = 'target-url';
    targetUrlP.textContent = targetUrl;
    container.appendChild(targetUrlP);

    // Crea e aggiungi il paragrafo per l'UUID
    const uuidP = document.createElement('p');
    uuidP.className = 'filename';
    uuidP.textContent = 'filename: ' + uuid;
    container.appendChild(uuidP);

    // Crea il contenitore per le azioni
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    // Crea il div per il form check
    const formCheckDiv = document.createElement('div');
    formCheckDiv.className = 'form-check form-switch m-1';

    // Crea e aggiungi la label
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.setAttribute('for', 'flexSwitchCheckChecked');
    label.textContent = 'Bypass';
    formCheckDiv.appendChild(label);

    // Crea e aggiungi il checkbox
    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.setAttribute('data-uuid', uuid);
    input.type = 'checkbox';
    input.role = 'switch';
    input.id = 'flexSwitchCheckChecked';
    input.checked = bypassCache;
    input.onchange = function () {
        bypassChange(this);
    }; // Assicurati che la funzione bypassChange sia definita
    formCheckDiv.appendChild(input);

    actionsDiv.appendChild(formCheckDiv);

    // Crea e aggiungi l'icona di modifica
    const editIcon = document.createElement('i');
    editIcon.className = 'bi bi-pencil-fill px-1';
    editIcon.onclick = () => editMock(uuid); // Assicurati che la funzione editMock sia definita
    actionsDiv.appendChild(editIcon);

    // Crea e aggiungi l'icona di cancellazione
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'bi bi-trash-fill px-1';
    deleteIcon.onclick = () => deleteMock(uuid); // Assicurati che la funzione deleteMock sia definita
    actionsDiv.appendChild(deleteIcon);

    // Aggiungi il contenitore delle azioni al contenitore principale
    container.appendChild(actionsDiv);

    return container;
}
