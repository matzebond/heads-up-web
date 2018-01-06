import express from 'express';
import bodyParser from 'body-parser';
import db from 'sqlite';

import DatabaseWrapper from './databaseWrapper.js';
let wrapper = null;

import Tag from "../data/Tag";
import Entry from "../data/Entry";

const app = express();

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(allowCrossDomain);


app.get("/info", (req, res) => {
    wrapper.getInfo()
        .then(info => {
            res.status(200).json(info);
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});


app.get("/tags", (req, res) => {
    const query = req.query.q;
    const lang = req.query.lang;
    wrapper.getTagList(query, lang)
        .then(tags => {
            res.status(200).json(tags).end();
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

app.get("/tags/:id", (req, res) => {
    const tagID = req.params.id;
    const lang = req.query.lang;
    wrapper.getTagById(tagID, lang)
        .then(tag => {
            if (!tag) {
                res.status(404).send(`no tag with id ${tagID}`).end();
                return;
            }
            res.status(200).json(tag).end();
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});



const parseEntryBody = (body) => {
    let entry;

    try {
        entry = new Entry(body);
    } catch (err) {
        console.log(err);
        throw "Wrong format.";
    }

    if(!entry.text) {
        throw "The entry needs a text.";
    }

    if(entry.tags.length === 0) {
        throw "The entry need at least one tag.";
    }

    return entry;
};

app.post("/entries", async (req, res) => {
    console.log("add", JSON.stringify(req.body));
    let entry = null;
    try {
        entry = parseEntryBody(req.body);

        if (entry.id !== null) {
            throw `can't add entry with id ${entry.id}`;
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err).end();
        return;
    }

    const result = await wrapper.updateOrAddEntry(entry);

    if (result.entry === undefined) {
        res.status(result.status).send(result.msg).end();
        return;
    }

    //return the created entry and all tags
    const tags = await wrapper.getTagList();
    res.status(201).json({entry: result.entry, tags}).end();
});

app.put("/entries/:id", async (req, res) => {
    console.log("update", JSON.stringify(req.body));

    let entry = null;
    try {
        entry = parseEntryBody(req.body);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err).end();
        return;
    }

    const result = await wrapper.updateOrAddEntry(entry);

    if (result.entry === undefined) {
        res.status(result.status).send(result.msg).end();
        return;
    }

    //return the updated entry and all tags
    const tags = await wrapper.getTagList();
    res.status(200).json({entry: result.entry, tags}).end();
});

app.delete("/entries/:id", (req, res) => {
    const entryID = req.params.id;
    console.log("delete " + entryID);
    wrapper.deleteEntry(entryID)
        .then(() => {
          res.status(200).send(`successfully deleted entry ${entryID}`);
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

app.get("/entries", (req, res) => {
    const entryText = req.query.q;
    const lang = req.query.lang;
    wrapper.getEntryList(entryText, lang)
        .then(entries => {
            res.json(entries).end();
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

app.get("/entries/:id", (req, res) => {
    const entryID = req.params.id;
    const lang = req.query.lang;
    wrapper.getEntryByID(entryID, lang)
        .then(entry => {
            if (!entry) {
                res.status(404).send(`no entry with id ${entryID}`).end();
                return;
            }
            res.json(entry).end();
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});



export default function start_server(db, port) {
    wrapper = new DatabaseWrapper(db);

    let server = app.listen(port, (err) => {
        if (err) {
            console.log(`couldn't start server at ${port}`, err);
            return;
        }
        let host = server.address().address;
        let port = server.address().port;
        console.log(`rest api listening at http://${host}:${port}`);
    });
}

