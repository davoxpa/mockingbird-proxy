const express = require("express");
const cors = require("cors"); // Importa il middleware cors
const { proxySniffer } = require("./proxy.helper");


const app = express();
// const PORT = process.env.PORT || 3000;

app.use(express.json()); // per i body di tipo JSON
app.use(express.urlencoded({ extended: true })); // per i body di tipo form-data

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Disabilita la verifica del certificato (SOLO per sviluppo)
app.use(cors());

// url per controllare lo stato del server
app.get("/health", (req, res) => {
  res.send("ready");
});

// const routeMock = require("./src/routes/routeMock.js");
app.use('/*', proxySniffer);

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