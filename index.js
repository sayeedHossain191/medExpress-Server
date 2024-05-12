const cors = require('cors')
const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// const corsOptions = {
//     origin: 'http://localhost:5173',
//     credentials: true,
//     optionSuccessStatus: 200,
// }

app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.bbzq5pl.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        const serviceCollection = client.db('doctorConsultation').collection('service')

        app.get('/service', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        //Single service details
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.json(result)
        })

        //Add service
        app.post('/service', async (req, res) => {
            const newService = req.body;
            console.log(newService);
            const result = await serviceCollection.insertOne(newService);
            res.send(result)
        })

        //Update Service
        app.put('/addService/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateService = req.body;

            const service = {
                $set: {
                    service_name: updateService.service_name,
                    service_image: updateService.service_image,
                    service_location: updateService.service_location,
                    description: updateService.description,
                    price: updateService.price,

                }
            }

            const result = await serviceCollection.updateOne(filter, service, options)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Consultation Site is Running')
})

app.listen(port, () => {
    console.log(`Consultation Site is Running on port ${port}`)
})