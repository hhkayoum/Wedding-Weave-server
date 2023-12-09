const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//middleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt8lz60.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const reviewCollection = client.db("metromony").collection("revew");
    const premiumRequestCollection = client
      .db("metromony")
      .collection("premiumRequest");
    const contactRequestCollection = client
      .db("metromony")
      .collection("contactRequest");
    const usersCollection = client.db("metromony").collection("users");
    const biodataCollection = client.db("metromony").collection("biodata");
    const favouritesCollection = client
      .db("metromony")
      .collection("favourites");

    //contact Request Collection
    app.post("/contactRequest", async (req, res) => {
      const contactReq = req.body;
      const result = await contactRequestCollection.insertOne(contactReq);
      res.send(result);
    });

    app.get("/contactRequest", async (req, res) => {
      const email = req.query.user;
      let query = {};
      if (email) {
        query.selfUserEmail = email;
      }
      const result = await contactRequestCollection.find(query).toArray();
      res.send(result);
    });
    //contact req delete
    app.delete("/contactRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contactRequestCollection.deleteOne(query);
      res.send(result);
    });
    //contact req approved
    app.patch("/contactRequest/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await contactRequestCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });
    //premium req collection
    app.post("/premiumRequest", async (req, res) => {
      const requestedData = req.body;
      const query = { userEmail: requestedData.userEmail };
      const existReq = await premiumRequestCollection.findOne(query);
      if (existReq) {
        return;
      }
      const result = await premiumRequestCollection.insertOne(requestedData);
      res.send(result);
    });
    //premium req data get
    app.get("/premiumRequest", async (req, res) => {
      const result = await premiumRequestCollection.find().toArray();
      res.send(result);
    });
    //premium req delete
    app.delete("/premiumRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await premiumRequestCollection.deleteOne(query);
      res.send(result);
    });
    //user collection
    //user post
    app.post("/users", async (req, res) => {
      const usersData = req.body;
      const query = { email: usersData.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return;
      }
      const result = await usersCollection.insertOne(usersData);
      res.send(result);
    });
    //user get
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    //user Delete
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    // user Admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //check admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    // favourites collection post
    app.post("/favourites", async (req, res) => {
      const favouritesItem = req.body;
      const result = await favouritesCollection.insertOne(favouritesItem);
      res.send(result);
    });
    //favourite item get
    app.get("/favourites/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await favouritesCollection.find(query).toArray();
      res.send(result);
    });
    //favourite item deleted
    app.delete("/favourites/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favouritesCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/revew", async (req, res) => {
      const result = await reviewCollection
        .find()
        .sort({
          marriageDate: 1,
        })
        .toArray();
      res.send(result);
    });
    app.get("/biodata/premiumMember", async (req, res) => {
      const result = await biodataCollection
        .find({ memberType: "Premium" })
        .sort({ age: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    //biodata get
    app.get("/biodata", async (req, res) => {
      const email = req.query.user;
      const bio = req.query.bioType;
      let query = {};
      if (email) {
        query.userEmail = email;
      }
      if (bio) {
        query.biodataType = bio;
      }
      const result = await biodataCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allBiodata/allData", async (req, res) => {
      const totalBiodata = await biodataCollection.find().toArray();
      const maleCount = await biodataCollection
        .find({ biodataType: "Male" })
        .toArray();
      const femaleCount = await biodataCollection
        .find({
          biodataType: "Female",
        })
        .toArray();
      const premiumCount = await biodataCollection
        .find({
          memberType: "Premium",
        })
        .toArray();

      res.send({
        totalBiodata,
        maleCount,
        femaleCount,
        premiumCount,
      });
    });

    //biodata post
    app.post("/biodata", async (req, res) => {
      const query = req.body;
      const result = await biodataCollection.insertOne(query);
      res.send(result);
    });
    //biodata member type update
    app.patch("/biodata/:email", async (req, res) => {
      const email = req.params.email;
      const filter = {
        userEmail: email,
      };
      const updatedDoc = {
        $set: {
          memberType: "Premium",
        },
      };
      const result = await biodataCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //biodata get by id
    app.get("/biodata/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await biodataCollection.findOne(query);
      res.send(result);
    });
    app.put("/updatedBiodata/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { userEmail: email };

      const options = { upsert: true };
      const updatedBiodata = req.body;

      const biodata = {
        $set: {
          biodataType: updatedBiodata.biodataType,
          profileImg: updatedBiodata.profileImg,
          dateOfBirth: updatedBiodata.dateOfBirth,
          height: updatedBiodata.height,
          weight: updatedBiodata.weight,
          age: updatedBiodata.age,
          occupation: updatedBiodata.occupation,
          permanentDivisionName: updatedBiodata.permanentDivisionName,
          presentDivisionName: updatedBiodata.presentDivisionName,
          expectedPartnerAge: updatedBiodata.expectedPartnerAge,
          expectedPartnerHeight: updatedBiodata.expectedPartnerHeight,
          expectedPartnerWeight: updatedBiodata.expectedPartnerWeight,
          mobileNumber: updatedBiodata.mobileNumber,
        },
      };
      console.log(biodata);
      const result = await biodataCollection.updateOne(
        filter,
        biodata,
        options
      );

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log(`running on port : ${port}`);
});
