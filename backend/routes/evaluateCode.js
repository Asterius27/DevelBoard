const express = require('express');
const util = require('util');
const router = express.Router();
const fs = require('fs');
const execp = util.promisify(require("child_process").exec);
const auth = require('../utils/auth');
const db = require('../utils/database');

router.use(auth.authenticateToken);

router.post('/', async (req, res, next) => {
    let challenge = [];
    let score = 0;
    let compile = false;
    db.executeQuery('MATCH (node:Challenge {title: $title}) RETURN node.resultCases as resultCases, node.testCases as testCases',
        {title: req.body.title},
        result => {
            challenge = result.records[0];
        },
        error => {
            console.log(error);
            return res.sendStatus(500);
        }
    );
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
    fs.writeFileSync(dirName + "/" + fileName, req.body.code); 
    let { stdout, stderr } = await execp("javac "+ dirName + "/" + fileName);
    if (!stderr) {
        compile = true;
        while (challenge.length === 0) {}
        let tests = [];
        let results = [];
        let tests_json = challenge.get(0).split('; '); // TODO order is random so get sometimes returns result cases other times the test cases
        let results_json = challenge.get(1).split('; ');
        tests_json.forEach((test) => tests.push(JSON.parse(test)));
        results_json.forEach((result) => results.push(JSON.parse(result)));
        // console.log(tests);
        for (let i = 0; i < tests.length; i++) {
            let args = "";
            for (let j = 0; j < tests[i].length; j++) {
                args = args + " " + tests[i][j];
            }
            console.log(args);
            let { stdout, stderr } = await execp("java -classpath " + dirName + " Challenge" + args); // TODO check looping program
            if (stderr) {
                console.log(stderr);
            }
            else {
                console.log(stdout);
                console.log(results[i][0]);
                if (stdout === results[i][0]) {
                    score = score + 1;
                }
            }
        }
    }
    else {
        console.log(err);
        console.log(execErr);
        compile = false;
    }
    // TODO save results on the db
    console.log(score);
    console.log(compile);
    fs.rmSync(dirName, { recursive: true, force: true });
    return res.sendStatus(200); // TODO send score
});

module.exports = router
