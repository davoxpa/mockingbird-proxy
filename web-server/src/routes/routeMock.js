const express = require("express");
const { midMockPrepare, midMockRes, midMockSave } = require("../helper/mock.helper");
const { proxyCustom, logRouter } = require("../helper/proxy.helper");
const router = express.Router();

router.all("/:domain/*", (req, res, next)=>{
    console.log("router mock work", req.url);
    next();
}, 
midMockPrepare, 
midMockRes, 
proxyCustom, 
midMockSave
);

module.exports = router;
