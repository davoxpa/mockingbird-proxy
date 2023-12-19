function changeStatusMock(uuid) {
    fetch('/manager/api/status/' + uuid, {
        method: 'POST',
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            // reload page
            location.reload();
        })
        .catch((err) => console.log(err));
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


function showMock(jsonData) {
    const modal = document.getElementById('modal');
    const pre = modal.querySelector('.json');
    pre.innerHTML = JSON.stringify(JSON.parse(jsonData), null, 2);

    modal.style.display = 'block';
}
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}