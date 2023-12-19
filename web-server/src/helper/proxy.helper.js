const https = require("https"); // o `https` se necessario

function logRouter(req, res, next) {
  console.log("req.url", req.url);
  next();
};

function proxyCustom(req, res, next) {
  const sections = req.originalUrl.split("/");
  target = `${req.params.domain}`;
  const options = {
    hostname: target, // Modifica con l'host desiderato
    path: req.url.replace(target + "/", ""),
    method: req.method,
    headers: req.headers,
  };
  console.log('options http', options	)

  options.headers.host = target; // Modifica con l'host desiderato

  // Gestisci il caso 'https' se necessario
  const proxyReq = https.request(options, (proxyRes) => {
    let responseData = "";
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    proxyRes.on("data", (chunk) => {
      responseData += chunk.toString();
      res.write(chunk);
    });

    proxyRes.on("end", () => {
      console.log(
        "%cResponse from : " + " " + req.method + " " + target + req.url,
        "color: #ff00ff; font-size: 16px"
      );
      try {
        req.mock.response = JSON.parse(responseData);
        req.mock.statusCode = proxyRes.statusCode;
        
      } catch (error) {
        req.mock.response = '';
        req.mock.statusCode = proxyRes.statusCode;
      }
      res.end();
      next();
    });
  });

  proxyReq.on("connect", (res, socket, head) => {
    console.log("Proxy connect");
  });

  proxyReq.on("error", (e) => {
    console.log(e);

    console.error(`Problema con la richiesta: ${e.message}`);
    res.status(500).send("Errore interno del server");
  });

  // Inoltra il body della richiesta originale
  req.pipe(proxyReq);
}
module.exports = {
  proxyCustom,
  logRouter,
};
