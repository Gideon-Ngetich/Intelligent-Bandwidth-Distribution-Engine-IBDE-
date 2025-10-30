import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
import { Routeros } from 'routeros-node';

const app = express()
app.use(cors())

let routeros;

async function login(host: string, port: number, user: string, password: string) {
    routeros = new Routeros({
        host,
        port,
        user,
        password
    })

    return routeros.connect();
}

app.post('/login', async (req, res) => {
    try {
        const { host, user, password, port} = req.body;

        await login(host, port, user, password)

        res.status(200).json({success: true, massage: "Login suessful"})
    } catch (error) {
        console.error(error)
        return res.status(500).json("Internal server error")
    }
})

const port = 3400
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})