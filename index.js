const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware

app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6vswd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const computerCollection = client.db("Computers").collection("computer")

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })
        app.get("/item/home", async (req, res) => {
            const query = {};
            const limit = 6;
            const cursor = computerCollection.find(query).limit(limit);
            const page = await cursor.toArray();
            res.send(page)
        })
        app.get("/item/", async (req, res) => {

            const query = {};
            const cursor = computerCollection.find(query);
            const item = await cursor.toArray();
            res.send(item)
        })
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await computerCollection.findOne(query);
            res.send(item);
        });
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            const result = await computerCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await computerCollection.deleteOne(query);
            res.send(result);
        })
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const result = await computerCollection.insertOne(newItem);
            res.send(result);
        })
        app.get('/myItem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = computerCollection.find(query);
                const item = await cursor.toArray();
                res.send(item);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
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
