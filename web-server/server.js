const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto"); // Importa il modulo crypto per l'hashing
const cors = require("cors"); // Importa il middleware cors
const fs = require("fs"); // Importa il modulo fs per la lettura del certificato
const util = require("util"); // Importa il modulo util per la stampa della risposta del server di destinazione
const { addResponseData, getResponseData, saveData} = require("./mockManager.js");
const http = require("https"); // o `https` se necessario
const { midMockPrepare, midMockSave, midMockRes } = require("./src/helper/mock.helper.js");
const { engine } = require("express-handlebars");
const path = require('path');
const Handlebars = require("handlebars");
const myHelpers = require("./src/handlebars/myHelper.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, './src/public')));

app.engine("handlebars", engine());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Disabilita la verifica del certificato (SOLO per sviluppo)
app.use(cors());

app.get("/health", (req, res) => {
  res.send("ready");
});

const routeMock = require("./src/routes/routeMock.js");
app.use('/', routeMock);

let server;
module.exports.startServer = (port) => {
  server = app.listen(port, () => {
    console.log(`Server proxy in ascolto sulla porta ${port}`);
  });
};
module.exports.stopServer = () => {
    if (server) {
        server.close(() => console.log('Server fermato'));
        server = null;
    }
};
module.exports.checkStatusServer = () => {
    if (server) {
        return true;
    } else {
        return false;
    }
};