const bcrypt = require("bcryptjs");
const { saveMock, getMock } = require("../../mockManager");
const crypto = require("crypto");

function hashData(data) {
    return bcrypt.hashSync(data, 10);
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 * @description `metodo per archiviare le chiamate in un file json`
 */
function midMockPrepare(req, res, next) {
    // console.log("mockHelper", req.proxyResponse);
    req['mock'] = {
        status: true,
        uuid: "",
        method: req.method,
        targetUrl: "",
        response: "",
        payload: "",
        statusCode: "",
    };
    req.mock.targetUrl = req.url.replace("/", "");
    req.mock.uuid = crypto
      .createHash("sha256")
      .update(req.mock.targetUrl)
      .digest("hex");

    req.on("start", () => {
        console.log("start");
    });
    req.on("data", (chunk) => {
        if (req.method === "POST" || req.method === "PUT") {
            console.log("mockhelper / Dimensione del Body:", chunk.length, "caratteri");
            req.mock.payload = chunk.length > 0 ? JSON.parse(chunk.toString()): "";
            req.mock.uuid = crypto
              .createHash("sha256")
              .update(req.mock.targetUrl + req.mock.payload)
              .digest("hex");
        }
    });

    next();
}
function midMockRes(req, res, next) {
    const mockResult = getMock(req.mock.uuid);

    if (mockResult && mockResult.status) {
        if (mockResult.statusCode) {
            res.status(mockResult.statusCode).json(mockResult.response)
            
        }
        res.send(mockResult.response);
    }else{
        next();
    }
}
function midMockSave(req, res, next) {
    const localMock = getMock(req.mock.uuid);
    if (localMock) {
        next();
    }else{
        console.log("mockHelper", req.mock);
        const mockFile = { ...req.mock }
        let fileName = mockFile.uuid;
    
        saveMock(fileName, mockFile);
        
    
        next();
    }
}


module.exports = {
    midMockPrepare,
    midMockSave,
    midMockRes,
    hashData,
};