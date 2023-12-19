let editor = null; // Variabile globale per mantenere l'editor

function showMockOnModal(data) {
    const options = {};
    const myModalAlternative = new bootstrap.Modal('#modaljson', options);
    const container = document.getElementById('jsoneditor');

    // Pulisce il contenitore se l'editor esiste già
    if (editor) {
        editor.destroy();
    }

    // Crea una nuova istanza dell'editor
    editor = new JSONEditor(container, options);
    editor.set(data);

    // Mostra la modale
    myModalAlternative.show();
}

function deleteMock(uuid) {
    fetch('/manager/api/delete/' + uuid, {
        method: 'DELETE',
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            // reload page
            location.reload();
        })
        .catch((err) => console.log(err));
}

async function getMockForModal(uuid) {
    try {
        const res = await fetch('/manager/api/get/' + uuid);
        const data = await res.json();
        console.log(data);
        showMockOnModal(data.response);
    } catch (err) {
        console.log(err);
    }
}