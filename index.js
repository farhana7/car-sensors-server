const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ir5um.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("car_sensors");
    const productCollection = database.collection("products");
    const bookingCollection = client.db("car_sensors").collection("bookings");
    const usersCollection = database.collection("users");

    //GET Products API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    //Get Single Product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific product", id);
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });

    //POST API
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);
      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });

    //DELETE API
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });

    //Bookings-----------------------
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      // console.log(query);
      const cursor = bookingCollection.find(query);
      const purchases = await cursor.toArray();
      res.json(purchases);
    });

    app.post("/bookings", async (req, res) => {
      const purchase = req.body;
      const result = await bookingCollection.insertOne(purchase);
      console.log(result);
      res.json(result);
    });

    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log("abc", id, query);
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    //users----------------------------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      // console.log("put", user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      // const email = req.body;
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // console.log("database connected successfully");
  } finally {
    //   await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Car Sensors!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
