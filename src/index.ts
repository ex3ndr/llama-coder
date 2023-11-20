require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
console.log('Starting Ollama Proxy...');

// Model
const ENV_MODEL = process.env.OLLAMA_MODEL!;
const ENV_ENDPOINT = process.env.OLLAMA_ENDPOINT! + '/api/generate';

// Server
const app = express()
const port = 3000;
app.get('/', (req, res) => {
    res.send('Welcome to Ollama Proxy!');
});
app.use(bodyParser.json());
app.post('/api/generate', (req, res) => {
    let body = req.body as { inputs: string, parameters: any };
    console.log('Requested: inputs = ' + body.inputs);
    (async () => {
        try {
            console.warn('generating...');
            let ai = await axios.post(ENV_ENDPOINT, {
                model: ENV_MODEL,
                prompt: body.inputs,
                stream: false,
                raw: true,
                options: {
                    num_predict: 256
                }
            });
            console.warn('result: ' + ai.data.response);
            res.status(200)
                .send({ generated_text: ai.data.response });
        } catch (e) {
            console.warn(e);
            res
                .status(500)
                .send({ error: true });
        }
    })();
});


// Start
app.listen(port, () => {
    console.log('Started');
});