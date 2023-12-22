const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('getWorkingDirPath');
});

ipcRenderer.on('responseGetWorkingDirPath', (event, data) => {
    debugger;
    data.forEach(element => {
        const p = document.createElement('p');
        p.classList.add('path');
        p.innerHTML = element;
        p.addEventListener('click', (e) => {
            console.log('click', e.target.innerHTML);
            ipcRenderer.send('openHistoryDir', e.target.innerHTML);
        });

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas');
        deleteIcon.classList.add('fa-trash');
        deleteIcon.classList.add('delete');
        deleteIcon.addEventListener('click', (e) => {
            console.log('delete', e.target.parentElement.innerHTML);
            ipcRenderer.send('deleteMock', e.target.parentElement.innerHTML);
        });

        const div = document.createElement('div');
        div.classList.add('col-12');
        div.appendChild(p);
        div.appendChild(deleteIcon);

        document.querySelector('.path-history').appendChild(div);
    });
    console.log('responseGetWorkingDirPath js', data);
    // document.querySelectorAll('.path').addEventListener('click', (e) => {
    //     console.log('click', e);
    // });
});

function selectDirectory() {
    ipcRenderer.send('selectDir');
}
ipcRenderer.on('responseSelectDir', (event, data) => {
    console.log('responseSelectDir js', data);
    document.querySelector('.success').innerHTML = data;
    setTimeout(() => {
        document.querySelector('.success').innerHTML = '';
    }, 1000);
});
ipcRenderer.on('errorSelectDir', (event, data) => {
    console.log('errorSelectDir js', data);
    document.querySelector('.error').innerHTML = 'Errore nella scrittura della cartella: ' + data;
    setTimeout(() => {
        document.querySelector('.error').innerHTML = '';
    }, 3000);
});
