const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const db = require('../utils/database');

//router.use(auth.authenticateToken);

router.post('/', (req, res) => {

    let date=''+req.body.expireDate.year+'-'+req.body.expireDate.month+'-'+req.body.expireDate.day+'T'+req.body.expireDate.hour+
    ':'+req.body.expireDate.minute+':00.000';

    let title=req.body.title;

    let challenge={
        description: req.body.description,
        language: req.body.language,
        testCases: req.body.testCases
    };

    /*let jsonData=JSON.stringify(challenge);

    var fs = require('fs');

    fs.writeFile("../resources/"+title, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });*/

    db.executeQuery(
        'CREATE (node:Challenge {title: $title, expireDate: localdatetime($date), description: $description, language: $language, testCases: $testCases}) RETURN node',
        {title: title, date: date, description: req.body.description, language: req.body.language, testCases: req.body.testCases},
        result => {
            console.log(result.records);
            res.sendStatus(200);
        },
        error => {
            console.log(error);
            res.sendStatus(500);
        }
    );

});

router.get('/',(req, res) => {
    db.executeQuery('MATCH (node:Challenge) RETURN node.title as title , node.expireDate as expireDate',
        null, 
        result => {
            let challenges=new Array;
            result.records.forEach(chall =>challenges.push({title: chall.get('title'), expireDate: chall.get('expireDate')})); //rivedi la data così non va
            res.status(200).json(challenges);
        },
        error => {
            console.log(error);
            res.sendStatus(500);
        }
    );
});

router.get('/:title',(req, res) => {
    console.log("hey")
    db.executeQuery('MATCH (node:Challenge {title: $title}) RETURN node.title as title , node.expireDate as expireDate',
        {title: req.params.title}, 
        result => {
            let challenge;
            result.records.forEach(chall => challenge={"title": chall.get("title"), "expireDate": chall.get("expireDate")}); //rivedi la data così non va
            res.status(200).json(challenge);
        },
        error => {
            console.log(error);
            res.sendStatus(500);
        }
    );
});

router.post('/prova', (req, res) => {

    db.executeQuery(
        'Match (node:Challenge {title: $title}) RETURN node.title as title',
        {title: req.body.title},
        result => {
            result.records.forEach(r => console.log(r.get('title')));
            res.sendStatus(200);
        },
        error => {
            console.log(error);
            res.sendStatus(500);
        }
    );
});

module.exports = router