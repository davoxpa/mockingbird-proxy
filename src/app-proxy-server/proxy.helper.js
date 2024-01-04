const https = require('https'); // o `https` se necessario
const crypto = require('crypto');
const { getMock, saveMock } = require('./mockManager');
const StoreManager = require('../storeManager');
const storeManager = StoreManager.getInstance();


async function proxySniffer(req, res, next) {
    try {
        const config = storeManager.getConfig();
        target = req.originalUrl.replace('/', '');
        // Genera l'hash SHA-256 dell'URL, del body
        const sha256 = crypto
            .createHash('sha256')
            .update(target + JSON.stringify(req.body))
            .digest('hex');

        // Verifica se l'hash è presente in cache
        const mockArchive = getMock(sha256);
        if (!config.bypassGlobal && mockArchive && !mockArchive.bypassCache) {
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
                payload: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
                targetUrl: target,
                response: responseData || undefined,
                statusCode: externalResponse.status || undefined,
                timestamp: new Date().getTime(),
            };

            // Salva la risposta in json
            if (!config.bypassGlobal && !mockArchive) {
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
