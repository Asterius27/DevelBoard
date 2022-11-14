const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const db = require('./utils/database');

router.use(auth.authenticateToken);

router.post('/', (req, res) => {

    let date=''+req.body.expireDate.year+'-'+req.body.expireDate.month+'-'+req.body.expireDate.day+'T'+req.expireDate.hour+
    ':'+req.expireDate.minute+':00.000';

    let title=req.body.title;

    let challenge={
        description: req.body.description,
        language: req.body.language,
        testCases: req.body.testCases
    };

    let jsonData=JSON.stringify(challenge);

    var fs = require('fs');

    fs.writeFile("../resources/"+title, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });

    db.executeQuery('CREATE (node:Challenge {title: $title, expireDate: localdatetime($date)} RETURN node',
    {title: title, date: date},
    function (result){
        console.log(result.records[0].get('title'));
        res.sendStatus(200);
    });

});

router.get('/',(req, res) => {
    db.executeQuery('MATCH (node:Challenge) RETURN node.title, node.expireDate', null, 
    function (result){
        challenges=new Array;
        for (chall in result.records){
            challenges.push({title: chall.get('title'), expireDate: chall.get('expireDate')}); //rivedi la data così non va
        }

        res.sendStatus(200).json(challenges)
    });
});


module.exports = router