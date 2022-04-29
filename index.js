const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6vswd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const computerCollection = client.db("Computers").collection("computer")
        app.get("/item/home", async (req, res) => {
            const query = {};
            const limit = 6;
            const cursor = computerCollection.find(query).limit(limit);
            const page = await cursor.toArray();
            res.send(page)
        })
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await computerCollection.findOne(query);
            res.send(item);
        });
        app.get("/item", async (req, res) => {
            const query = {};
            const cursor = computerCollection.find(query);
            const page = await cursor.toArray();
            res.send(page)
        })

    }
    finally {

    }
}


run().catch(console.dir);
app.get('/', (req, res) => {
    res.send("Running Genius Server")
})

app.listen(port, () => {
    console.log(`Listening to ${port}`)
})
