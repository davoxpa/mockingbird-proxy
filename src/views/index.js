const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

let prefixUrl = '';

window.addEventListener('load', () => {
    ipcRenderer.send('checkServerRunning');
    ipcRenderer.send('getConfig');
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
    if(localStorage.getItem('search')){
        document.querySelector('#search').value = localStorage.getItem('search');
        searchMock();
    }
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

ipcRenderer.on('responseGetConfig', (event, config) => {
    console.log('responseGetConfig', config);
    document.querySelector('#path').innerHTML = config.dirPath;
    document.querySelector('#bypassGlobal').checked = config.bypassGlobal;
});

ipcRenderer.on('responseFilesList', (event, files) => {
    console.log('File nella cartella:', files);
    let test = files.map((file) => file.targetUrl);
    console.log('test', test);
    // insert list of mock in html
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
  localStorage.setItem('uuid', uuid);
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
  prefixUrl = 'http://localhost:' + document.querySelector('#port').value + '/';
  // create element span 
  document.querySelector('#config').innerHTML = '';
  const span = document.createElement('span');
  span.className = 'url-prefix';
  span.textContent = prefixUrl;
  span.onclick = () => copyPrefixUrl();
  document.querySelector('#config').appendChild(span);
  const spanExample = document.createElement('span');
  spanExample.className = 'url-prefix-example';
  spanExample.textContent = 'https://your-real-api-url.com/api/v1/...';
  document.querySelector('#config').appendChild(spanExample);
  
  // document.querySelector('#config').innerHTML = prefixUrl + 'https://your-real-api-url.com/api/v1/...';
  document.querySelector('#port').disabled = true;
  // document.querySelector('#path').disabled = true;
  document.querySelector('#stop').classList.remove('d-none');
  document.querySelector('#play').classList.add('d-none');
  document.querySelector('.led').classList.add('led-on');
}
ipcRenderer.on('responseStartServer', (event, port) => {
  changeUiToServerStart();
  localStorage.setItem('port', port);
  console.log('responseStartServer', port);
});

async function copyPrefixUrl() {
  // add effect to button on click
  document.querySelector('#config .url-prefix').classList.add('copy-clicked');
  document.querySelector('#copy').classList.add('copy-clicked');
  setTimeout(() => {
    document.querySelector('#config .url-prefix').classList.remove('copy-clicked');
    document.querySelector('#copy').classList.remove('copy-clicked');
  }, 500);
  try {
    await navigator.clipboard.writeText(prefixUrl);
  }
  catch (err) {
    console.error('Failed to copy: ', err);
  }
}

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

function showConfirmDelete() {
  document.querySelector('.delete-all').classList.add('d-none');
  document.querySelector('.confirm-delete-all').classList.remove('d-none');
  document.querySelector('.confirm-delete-all').classList.add('timer');
  setTimeout(() => {
    hideConfirmDelete();
  }, 5000);
}

function hideConfirmDelete() {
  document.querySelector('.confirm-delete-all').classList.add('d-none');
  document.querySelector('.delete-all').classList.remove('d-none');
}

function deleteAllMock() {
  ipcRenderer.send('deleteAllMock');
  hideConfirmDelete();
}
ipcRenderer.on('responseDeleteAllMock', (event) => {
  ipcRenderer.send('requestFilesList');
});

function searchMock() {
  const search = document.querySelector('#search').value;
  // save search in localstorage
  localStorage.setItem('search', search);
  ipcRenderer.send('searchMock', search);
}
ipcRenderer.on('responseSearchMock', (event, files) => {
  console.log('responseSearchMock', files);
  document.querySelector('.row-mock').innerHTML = '';
  files.forEach((file) => {
    // generateMockRow(file);
    const mockElement = createMockElement(file);
    document.querySelector('.row-mock').appendChild(mockElement);
  });
});

let logInterval;
function readLogs() {
  ipcRenderer.send('readLogs');
  const sectionLogs = document.querySelector('.logs-section .logs-section-container');
  sectionLogs.classList.remove('d-none');
  sectionLogs.classList.add('d-block');
  document.querySelector('.logs-section .logs-section-buttons #logs-open').classList.add('d-none');
  document.querySelector('.logs-section .logs-section-buttons #logs-close').classList.remove('d-none');
  document.querySelector('body').style.paddingBottom = '25vh';
  logInterval = setInterval(() => {
    ipcRenderer.send('readLogs');
  }, 100000);
  setTimeout(() => {
      // scroll to bottom
      sectionLogs.scrollTop = sectionLogs.scrollHeight;
  }, 30);
}
ipcRenderer.on('responseReadLogs', (event, logs) => {
    console.log('responseReadLogs', logs);
    document.querySelector('.logs-section .logs-section-container').innerHTML = '';
    logs.forEach((log) => {
        const p = document.createElement('p');
        p.textContent = log.message;
        p.className = `log-type-${log.type}`;
        document.querySelector('.logs-section .logs-section-container').appendChild(p);
    });
});
function hideLogs() {
  const sectionLogs = document.querySelector('.logs-section .logs-section-container');
  sectionLogs.classList.remove('d-block');
  sectionLogs.classList.add('d-none');

  document.querySelector('.logs-section .logs-section-buttons #logs-open').classList.remove('d-none');
  document.querySelector('.logs-section .logs-section-buttons #logs-close').classList.add('d-none');
  document.querySelector('body').style.paddingBottom = '30px';
  clearInterval(logInterval);
}


function resetSearch(){
  document.querySelector('#search').value = '';
  localStorage.removeItem('search');
  ipcRenderer.send('requestFilesList');
}

function bypassChange(el) {
    console.log('bypassChange', el);
    const status = el.checked ? true : false;
    ipcRenderer.send('changeValueMock', el.dataset.uuid, 'bypassCache', status);
}

function bypassAllChange(el) {
    console.log('bypassAllChange', el);
    ipcRenderer.send('byPassGlobalChange', el.checked);
}

function openPageCreateMock() {
    ipcRenderer.send('openPageCreateMock');
}

// Generate dom element for mock

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
