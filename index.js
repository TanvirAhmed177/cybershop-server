const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
console.log(process.env.DB_USER);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dz2ta.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const ObjectID = require("mongodb").ObjectID;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productCollection = client.db("shop").collection("products");
  const orderCollection = client.db("shop").collection("orders");
  // perform actions on the collection object
  console.log("Database Connected");

  app.get("/products", (req, res) => {
    productCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });
  app.get("/orders", (req, res) => {
    console.log(req.query.email);
    orderCollection.find({ email: req.query.email }).toArray((err, items) => {
      res.send(items);
    });
  });
  app.post("/addOrders", (req, res) => {
    const newOrder = req.body;
    console.log(newOrder);
    orderCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/products/:name", (req, res) => {
    productCollection.find({ name: req.params.name }).toArray((err, items) => {
      res.send(items[0]);
    });
  });
  app.post("/addProducts", (req, res) => {
    const newEvent = req.body;
    console.log("Adding Product", newEvent);
    productCollection.insertOne(newEvent).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteProduct/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    productCollection
      .findOneAndDelete({ _id: id })
      .then((documents) => res.send(documents.deletedCount > 0));
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
