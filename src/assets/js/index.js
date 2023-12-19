const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

window.addEventListener('load', () => {
  ipcRenderer.send('checkServerRunning');
});

function generateMockRow(data) {
  const templatePath = path.join(__dirname, '../assets/templates/row-mock.html');
  fs.readFile(templatePath, 'utf8', (err, html) => {
      if (err) {
          console.error('Errore nella lettura del file:', err);
          return;
      }
      let template = html
          .replace('{{method}}', data.method)
          .replace('{{targetUrl}}', data.targetUrl)
          .replace(/{{uuid}}/g, data.uuid);

      let templateHtml = document.querySelector('.row-mock').innerHTML;
      templateHtml += template;
      document.querySelector('.row-mock').innerHTML = templateHtml;
  });
}

ipcRenderer.on('responseCheckServerRunning', (event, status) => {
    console.log('responseCheckServerRunning');
    if (status) {
      changeUiToServerStart();
    }else{
      changeUiToServerStop();
    }
});

ipcRenderer.on('responseFilesList', (event, files) => {
    console.log('File nella cartella:', files);
    // Qui puoi manipolare il DOM per mostrare i file...
    document.querySelector('.row-mock').innerHTML = '';
    files.forEach((file) => {
        generateMockRow(file);
    });
    
});

// setInterval(() => {
//   ipcRenderer.send('requestFilesList');
// }, 1000*15);
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
  writeLocalStorage('port', '');
  console.log('responseStopServer');
});

function writeLocalStorage(name, value) {
    localStorage.setItem(name, value);
}