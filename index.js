const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const objectId = require("mongodb").ObjectID;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const password = process.env.DB_PASS;
const MongoClient = require("mongodb").MongoClient;
const { json } = require("body-parser");
const uri = `mongodb+srv://yasin:${password}@cluster0.styhn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const db = client.db("db2");
  // perform actions on the collection object
  app.get("/get/services", (req, res) => {
    db.collection("services")
      .find({})
      .toArray((err, docs) => {
        res.send(JSON.stringify(docs));
      });
  });
  app.get("/get/reviews", (req, res) => {
    db.collection("reviews")
      .find({})
      .toArray((err, docs) => {
        res.send(JSON.stringify(docs));
      });
  });
  app.post("/get/ordered", async (req, res) => {
    await db
      .collection("ordered")
      .find({})
      .toArray((err, docs) => {
        let allData = [];
        allData = docs;
        if (req.body.role === "admin") {
          res.send(JSON.stringify(allData));
        } else {
          let x = [];

          allData.map((data) => {
            if (data.name === req.body.email) {
              x.push(data);
            }
          });
          res.send(JSON.stringify(x));
        }
      });
  });

  app.post("/add/order", async (req, res) => {
    db.collection("ordered")
      .insertOne(req.body)
      .then((data) => {
        res.send(JSON.stringify(data));
      });
  });

  app.post("/change/status", async (req, res) => {
    db.collection("ordered").updateOne(
      { _id: objectId(req.body.id) },
      { $set: { status: [req.body.act] } },
      function (err, data) {
        if (data.matchedCount >= 1) {
          res.send(JSON.stringify({ message: "updated" }));
        } else {
          res.send(JSON.stringify({ message: "failed" }));
        }
      }
    );
  });

  app.post("/get/user", async (req, res) => {
    if (req.body.role === "admin") {
      db.collection("users")
        .findOne(req.body)
        .then((data) => res.send(JSON.stringify(data)));
    }
  });

  app.post("/add/user", (req, res) => {
    let messageSuccess = { message: "entry added" };

    db.collection("users")
      .insertOne(req.body)
      .then(function (result) {
        result.insertedCount === 1 && res.send(JSON.stringify(messageSuccess));
      });
  });
  app.post("/add/service", (req, res) => {
    let messageSuccess = { message: "entry added" };

    db.collection("services")
      .insertOne(req.body)
      .then(function (result) {
        result.insertedCount === 1 && res.send(JSON.stringify(messageSuccess));
      });
  });
  app.post("/delete/service", async (req, res) => {
    db.collection("services")
      .deleteOne({ _id: objectId(req.body.id) })
      .then((data) => {
        res.send(JSON.stringify(data));
      });
  });
  app.post("/add/review", async (req, res) => {
    let messageSuccess = { message: "review added" };
    db.collection("reviews")
      .insertOne(req.body)
      .then(function (result) {
        result.insertedCount === 1 && res.send(JSON.stringify(messageSuccess));
      });
  });
});

app.listen(process.env.PORT || 3030);
