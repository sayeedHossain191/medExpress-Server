const cors = require('cors')
const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//Middleware
app.use(
    cors({
        origin: ['http://localhost:5173', 'https://b9a11-consultation-client.web.app', 'https://b9a11-consultation-client.firebaseapp.com'],
        credentials: true,
        optionSuccessStatus: 200,
    })
)


//app.use(cors())
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

        const serviceCollection = client.db('doctorConsultation').collection('service');
        const addedServiceCollection = client.db('doctorConsultation').collection('addService');
        const bookedServiceCollection = client.db('doctorConsultation').collection('bookedService');


        app.get('/service', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        //Pagination starts
        app.get('/all-service', async (req, res) => {
            const page = parseInt(req.query.page) - 1
            const size = parseInt(req.query.size)

            const cursor = serviceCollection.find();
            const result = await cursor
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result)
        })
        //Service count
        app.get('/service-count', async (req, res) => {
            const count = await serviceCollection.estimatedDocumentCount();
            res.send({ count })
        })
        //Pagination Ends



        //Single service details
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.json(result)
        })



        //Add service
        app.post('/addService', async (req, res) => {
            const newService = req.body;
            console.log(newService);
            const result = await addedServiceCollection.insertOne(newService);
            res.send(result)
        })

        //Get the added service posted by specific user/provider
        app.get('/addService/:email', async (req, res) => {
            const email = req.params.email
            const query = { 'serviceProvider.email': email }
            const result = await addedServiceCollection.find(query).toArray();
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
                    name: updateService.name,
                    image: updateService.image,
                    area: updateService.area,
                    description: updateService.description,
                    price: updateService.price,
                }
            }

            const result = await addedServiceCollection.updateOne(filter, service, options)
            res.send(result)
        })

        //Delete Service 
        app.delete('/addService/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addedServiceCollection.deleteOne(query);
            res.send(result);
        })

        //Booked service collection

        app.post('/bookedService', async (req, res) => {
            const serviceData = req.body;
            console.log(serviceData);
            const result = await bookedServiceCollection.insertOne(serviceData);
            res.send(result)
        })

        app.get('/bookedService/:email', async (req, res) => {
            const email = req.params.email
            const query = { user_email: email }
            const result = await bookedServiceCollection.find(query).toArray();
            res.send(result)
        })

        //Filter 
        app.get('/service-filter/:email', async (req, res) => {
            const email = req.params.email
            const query = { user_email: email }
            const filter = req.query.filter

            let querySearch = {}
            if (filter) querySearch = { category: filter }

            const result = await bookedServiceCollection.find(query)
                .toArray()
                .find(querySearch)




            res.send(result)
        })



        // Send a ping to confirm a successful connection

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