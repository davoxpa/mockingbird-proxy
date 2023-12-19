const express = require('express');
const { getMock, getAllMock, saveMock, deleteMock } = require('../../mockManager');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/', (req, res) => {
    const mocks = getAllMock();
    res.render('main', { mocks });
});

router.get('/api/get/:uuid', (req, res) => {
    const mock = getMock(req.params.uuid);
    res.json(mock);
})

router.post('/api/status/:uuid', (req, res) => {
    const mock = getMock(req.params.uuid);
    mock.status = !mock.status;
    saveMock(req.params.uuid, mock);
    res.json(mock);
})

router.delete('/api/delete/:uuid', (req, res) => {
    const response = deleteMock(req.params.uuid);
    res.json(response);
})

module.exports = router;
