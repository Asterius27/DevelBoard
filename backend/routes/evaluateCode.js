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
    let max_score = 0;
    let compile = false;
    let results = [];
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
    try {
        let { stdout, stderr } = await execp("javac "+ dirName + "/" + fileName);
        if (!stderr) {
            compile = true;
            while (challenge.length === 0) {}
            let tests = [];
            let tests_json = challenge.get("testCases").split('; ');
            let results_json = challenge.get("resultCases").split('; ');
            tests_json.forEach((test) => tests.push(JSON.parse(test)));
            results_json.forEach((result) => results.push(JSON.parse(result)));
            // console.log(tests);
            for (let i = 0; i < tests.length; i++) {
                let args = "";
                for (let j = 0; j < tests[i].length; j++) {
                    args = args + " " + tests[i][j];
                }
                // console.log(args);
                try {
                    let { stdout, stderr } = await execp("java -classpath " + dirName + " Challenge" + args, { timeout: 60000 });
                    if (stderr) {
                        console.log(stderr);
                    }
                    else {
                        let out = JSON.stringify(stdout).slice(1, -5); // TODO might be different in linux (docker)
                        let res_out = JSON.stringify(results[i][0]);
                        if (res_out.charAt(0) === '"') {
                            res_out = res_out.slice(1, -1);
                        }
                        // console.log(out);
                        // console.log(res_out);
                        if (out === res_out) {
                            score = score + 1;
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
        else {
            console.log(stderr);
            compile = false;
        }
    } catch (e) {
        while (challenge.length === 0) {}
        let results_json = challenge.get("resultCases").split('; ');
        results_json.forEach((result) => results.push(JSON.parse(result)));
        console.log(e);
        compile = false;
    }
    max_score = results.length;
    db.executeQuery('MATCH (p:Person), (c:Challenge) WHERE p.email = $email AND c.title = $title CREATE (p)-[r:RELTYPE {score: $score, compile: $compile, max_score: $max_score}]->(c) RETURN type(r)',
        {email: req.user.email, title: req.body.title, score: score, compile: compile, max_score: max_score}, 
        (result) => {
            // console.log(score);
            // console.log(compile);
            fs.rmSync(dirName, { recursive: true, force: true });
            return res.status(200).json({score: score, compile: compile, max_score: max_score});
        }, 
        (err) => {
            console.log(err);
            return res.sendStatus(500);
        }
    );
});

module.exports = router
