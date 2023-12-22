const https = require('https'); // o `https` se necessario
const crypto = require('crypto');
const { getMock, saveMock } = require('./mockManager');
const config = require('./server.config').config;

// function proxyCustom(req, res, next) {
//   target = `${req.params.domain}`;
//   const options = {
//     hostname: target, // Modifica con l'host desiderato
//     path: req.url.replace(target + "/", ""),
//     method: req.method,
//     headers: req.headers,
//   };
//   console.log('options http', options	)

//   options.headers.host = target; // Modifica con l'host desiderato

//   // Gestisci il caso 'https' se necessario
//   const proxyReq = https.request(options, (proxyRes) => {
//     let responseData = "";
//     res.writeHead(proxyRes.statusCode, proxyRes.headers);

//     proxyRes.on("data", (chunk) => {
//       responseData += chunk.toString();
//       res.write(chunk);
//     });

//     proxyRes.on("end", () => {
//       console.log(
//         "%cResponse from : " + " " + req.method + " " + target + req.url,
//         "color: #ff00ff; font-size: 16px"
//       );
//       try {
//         req.mock.response = JSON.parse(responseData);
//         req.mock.statusCode = proxyRes.statusCode;

//       } catch (error) {
//         req.mock.response = '';
//         req.mock.statusCode = proxyRes.statusCode;
//       }
//       res.end();
//       next();
//     });
//   });

//   proxyReq.on("connect", (res, socket, head) => {
//     console.log("Proxy connect");
//   });

//   proxyReq.on("error", (e) => {
//     console.log(e);

//     console.error(`Problema con la richiesta: ${e.message}`);
//     res.status(500).send("Errore interno del server");
//   });

//   // Inoltra il body della richiesta originale
//   req.pipe(proxyReq);
// }

async function proxySniffer(req, res, next) {
    try {
        target = req.originalUrl.replace('/', '');
        // Genera l'hash SHA-256 dell'URL, del body
        const sha256 = crypto
            .createHash('sha256')
            .update(target + JSON.stringify(req.body))
            .digest('hex');

        // Verifica se l'hash è presente in cache
        const mockArchive = getMock(sha256);
        if (mockArchive && !mockArchive.bypassCache) {
            // Restituisci la risposta dall'archivio
            res.status(mockArchive.statusCode).json(mockArchive.response);
        } else {
            // Inoltra la richiesta al server esterno

            const newHeaders = req.headers;
            newHeaders.host = target;
            delete newHeaders['content-length'];

            const externalResponse = await fetch(target, {
                method: req.method,
                headers: newHeaders,
                body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
            });

            const responseData = await externalResponse.json();

            let newMock = {
                bypassCache: config.bypassCache,
                uuid: sha256,
                method: req.method,
                payload: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
                targetUrl: target,
                response: responseData || undefined,
                statusCode: externalResponse.status || undefined,
                timestamp: new Date().getTime(),
            };

            // Salva la risposta in json
            if (!config.bypassSave) {
              saveMock(sha256, newMock);
            }

            // Restituisci la risposta al client
            res.json(responseData);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Errore interno del server');
    }
}

module.exports = {
    proxySniffer,
};
