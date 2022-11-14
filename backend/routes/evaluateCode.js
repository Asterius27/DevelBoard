const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require("child_process");

let i = 0;

router.post('/', (req, res, next) => {
    // TODO get test cases from db
    let fileName = "../submitted_code/file"+i+"."+req.body.language
    fs.writeFile(fileName, req.body.code, () => {
        exec("javac "+fileName, (execErr, out, err) => {
            if (!execErr && !err) {
                exec("java "+"../submitted_code/file"+i, (execErr, out, err) => { // TODO add test cases
                    console.log(`stdout: ${out}`);
                });
            }
        });
    });
    // TODO save results on the db
});

module.exports = router
