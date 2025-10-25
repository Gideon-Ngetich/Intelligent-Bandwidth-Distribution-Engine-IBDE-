import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();

const app = express()
app.use(cors())

const port = 3400
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})