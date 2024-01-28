const https = require('https'); // o `https` se necessario
const crypto = require('crypto');
const { getMock, saveMock } = require('./mockManager');
const StoreManager = require('../storeManager');
const e = require('express');
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
            if (mockArchive.delay) {
                await new Promise((resolve) => setTimeout(resolve, mockArchive.delay));
            }
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

            // check if response is json
            let responseData;
            const contentType = externalResponse.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                responseData = await externalResponse.json();
            }else{
                // La risposta è un file media o altro tipo di contenuto
                const responseData = await externalResponse
                res.set('Content-Type', contentType);
                res.send(responseData);
            }

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
            const excludeThisUrl = excludeUrl(target);
            if (!config.bypassGlobal && !mockArchive && !excludeThisUrl) {
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

// method for exclude some url from archive
const excludeUrl = (url) => {
    // if media file
    if (url.match(/\.(jpeg|jpg|gif|png|ico|css|js|woff|woff2|ttf|svg|eot)$/)) {
        return true;
    }
    return false;
};


module.exports = {
    proxySniffer,
};
