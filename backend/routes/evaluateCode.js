const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require("child_process");

router.post('/', (req, res, next) => {
    // TODO get test cases from db
    let i = 0;
    let dirName = "./submitted_code/file"+i;
    let fileName = "temp."+req.body.language;
    while(fs.existsSync(dirName)) {
        i = i + 1;
        dirName = "./submitted_code/file"+i;
    }
    fs.mkdirSync(dirName);
    // console.log(fileName);
    // console.log(req.body.code);
    fs.writeFile(dirName + "/" + fileName, req.body.code, (err) => {
        if (err) {
            console.log(err);
        }
        // console.log("file saved");
        exec("javac "+ dirName + "/" + fileName, (execErr, out, err) => {
            if (!execErr && !err) {
                exec("java -classpath " + dirName + " Challenge", (execErr, out, err) => { // TODO add test cases, all classes must be inside a Challenge class
                    if (err || execErr) {
                        // console.log(err);
                        // console.log(execErr);
                        fs.rmSync(dirName, { recursive: true, force: true });
                        return res.status(200).json({"cmd error": execErr, "program error": err});
                    }
                    else {
                        // console.log(out);
                        fs.rmSync(dirName, { recursive: true, force: true });
                        return res.status(200).json({"output": out});
                    }
                });
            }
            else {
                console.log(err);
                console.log(execErr);
            }
        });
    });
    // TODO save results on the db
});

module.exports = router
