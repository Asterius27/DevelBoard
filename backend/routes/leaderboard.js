const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const db = require('../utils/database');

//router.use(auth.authenticateToken); TODO uncomment this after testing

//this gives for each user the percentage of point in all the challenges, even the ones he didin't undertake
router.get('/', (req, res, next) => {

    db.executeQuery("Match (p:Person)-[r:RELTYPE]->(:Challenge) "+
        "Call{ "+
            "Match (c:Challenge) "+
            "Return count(DISTINCT c.title) as number "+
        "} "+
        "With p.email as email, (sum(toFloat(r.score)/toFloat(r.max_score)*100)) as percentage, number "+
        "Return email, percentage/number as percent_score",
        null,
        result =>{
            let rs=new Array;
            result.records.forEach(row => rs.push({email: row.get('email'), percentage: row.get('percent_score')}));
            return res.status(200).json(rs);
        },
        error =>{
            console.log(error);
            return res.sendStatus(500);
        }
    );
    
});
//like the one above but for only 1 user
router.get('/:email', (req, res, next) => {

    db.executeQuery("Match (p:Person{email: $email})-[r:RELTYPE]->(:Challenge) "+
        "Call{ "+
            "Match (c:Challenge) "+
            "Return count(DISTINCT c.title) as number "+
        "} "+
        "With p.email as email, (sum(toFloat(r.score)/toFloat(r.max_score)*100)) as percentage, number "+
        "RETURN percentage/number as percent_score",
        {email: req.params.email},
        result =>{
            let rs;
            result.records.forEach(row => rs=row.get('percent_score'));
            return res.status(200).json(rs);
        },
        error =>{
            console.log(error);
            return res.sendStatus(500);
        }
    );
    
});

//percentage score for all users on the challenge they took, not the ones they didn't
router.get('/completed', (req, res, next) => {

    db.executeQuery("Match (p:Person)-[r:RELTYPE]->(c:Challenge) "+
        "RETURN p.email as email, (toFloat(sum(r.score))/toFloat(sum(r.max_score)))*100 as percent_score",
        null,
        result =>{
            let rs=new Array;
            result.records.forEach(row => rs.push({email: row.get('email'), percentage: row.get('percent_score')}));
            return res.status(200).json(rs);
        },
        error =>{
            console.log(error);
            return res.sendStatus(500);
        }
    );
    
});
//percentage for a single user of the challenges he took
router.get('/completed/:email', (req, res, next) => {

    db.executeQuery("Match (p:Person{email: $email})-[r:RELTYPE]->(c:Challenge) "+
        "RETURN (toFloat(sum(r.score))/toFloat(sum(r.max_score)))*100 as percent_score",
        {email: req.params.email},
        result =>{
            let rs;
            result.records.forEach(row => rs=row.get('percent_score'));
            return res.status(200).json(rs);
        },
        error =>{
            console.log(error);
            return res.sendStatus(500);
        }
    );
    
});
//score of all users in a single challenge
router.get('/challenge/:title', (req, res, next) => {

    db.executeQuery("Match (p:Person)-[r:RELTYPE]->(c:Challenge {title: $title}) "+
        "RETURN p.email as email, (toFloat(r.score)/toFloat(r.max_score))*100 as percent_score",
        {title: req.params.title},
        result =>{
            let rs=new Array;
            result.records.forEach(row => rs.push({email: row.get('email'), percentage: row.get('percent_score')}));
            return res.status(200).json(rs);
        },
        error =>{
            console.log(error);
            return res.sendStatus(500);
        }
    );
    
});
//score of a single user on a single challenge
router.get('/challenge/:title/:email', (req, res, next) => {

    db.executeQuery("Match (p:Person {email: $email})-[r:RELTYPE]->(c:Challenge {title: $title}) "+
        "RETURN (toFloat(r.score)/toFloat(r.max_score))*100 as percent_score",
        {title: req.params.title, email: req.params.email},
        result =>{
            let rs;
            result.records.forEach(row => rs=row.get('percent_score'));
            return res.status(200).json(rs);
        },
        error =>{
            console.log(error);
            return res.sendStatus(500);
        }
    );
    
});