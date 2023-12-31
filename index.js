const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mucefdr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
 
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await
     client.connect((error) => {
      if(error){
        console.log(error)
        return;
      }
     });

    const toyCollection = client.db('toyDB').collection('toy')
    const categoryCollection = client.db('CatgegoryDB').collection('ToyCategoryDB')


    app.get('/', (req, res) => {
      res.send("Toys Are Coming soon")
    });

    // Filter data by email and sort by price ascending and descending
    app.get('/toys', async (req, res) => {
      const sortOptions = req.query.sort === 'descending' ? -1 : 1;
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await toyCollection.find(query).sort({ price: sortOptions }).toArray();
      res.send(result);
    })


    // set indexKey for named queries
    const indexKeys = { name: 1 }
    const indexOptions = { name: 'ToysName' }
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    console.log(result)

    // filter data for search text
    app.get('/toySearchByName/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } }
        ]
      }).limit(20).toArray();
      res.send(result);
    })

    // get All Inserted data 
    app.get('/toys', async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // findOne data to update Toy information
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result)
    })

    app.get('/category', async (req, res) => {
      const cursor = categoryCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // get One shop by category data
    app.get('/singleToyCategory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await categoryCollection.findOne(query);
      res.send(result);
    })

    // get all Shop By Category data 
    app.get('/category/:text', async (req, res) => {
      const result = await categoryCollection.find({ category: req.params.text }).toArray();
      res.send(result);
    })


    // Insert Data
    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    })

    // Update a Single Toy
    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          name: updatedToy.name,
          price: updatedToy.price,
          photo: updatedToy.photo,
          details: updatedToy.details,
          quantity: updatedToy.quantity
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options)
      res.send(result);
    })

    // delete My Toys Data 
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Toy store are running on port, ${port}`)
});