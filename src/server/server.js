const express = require('express');
// const Promise = require('bluebird').Promise;
// const db = require('sqlite').db;

// import express from 'express';
// import Promise from 'bluebird';
// import db from 'sqlite';

const myDB = require('./database3');

const port = 13750;

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.get('/tag/list', (request, response) => {
    myDB.listTags((tags) => {
        response.json({tags});
    });
});

app.get('/entry/:id', (request, response) => {
    myDB.getEntry( request.params.id, (entry) => {
        response.json(entry);
    });
});

app.post('/entry/add', (request, response) =>  {
    console.log('post at /entry/add');
    console.log(JSON.stringify(request.body));

    let text = request.body.text;
    let tags = request.body.tags;
    myDB.addEntry({text, tags}, (entryID) => {
        if (!entryID) {
            response.status(400).send('Entry already exists.').end();
            return;
        }
        response.status(200).json({entryID});
    });
});

let server = app.listen(port, (err) => {
    if (err) {
        console.log('something bad happened', err);
        return;
    }
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Example app listening at http://${host}:${port}`);
});

/*
Promise.resolve();

Promise.resolve()
// First, try connect to the database and update its schema to the latest version
    .then(() => db.open(dbFile, { Promise }))
    .then(() => db.migrate({ force: 'last' }))
    .catch(err => console.error(err.stack))
// Finally, launch Node.js app
    .finally(() => app.listen(port, (err) => {
        if (err) {
            console.log('something bad happened', err);
            return;
        }
        let host = server.address().address;
        let port = server.address().port;
        console.log(`Example app listening at http://${host}:${port}`);
    }))


let text = 'John Steward';
let tags = ['Comedian', 'last night host'];



db.run(`INSERT OR IGNORE INTO entries VALUES (NULL, ?)`, text)
    .then( res => {
        console.log(res);
    });

        if (err) throw err;
        if (this.lastID) {
            let entryID = this.lastID;

            tags.forEach(function(tag) {
            db.run(`INSERT OR IGNORE INTO tags VALUES (NULL, ?)`, tag, function(err) {
                if (err) throw err;

                if(this.lastID) {
                    let tagID = this.lastID;

                    db.run(`INSERT INTO entry_tag_map VALUES (?,?)`, entryID, tagID);
*/