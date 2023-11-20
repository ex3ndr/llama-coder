require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { autocomplete } from './prompts/autocomplete';
console.log('Starting Ollama Proxy...');

// Model
const ENV_MODEL = process.env.OLLAMA_MODEL!;
const ENV_ENDPOINT = process.env.OLLAMA_ENDPOINT!;

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
            let ai = await autocomplete({
                endpoint: ENV_ENDPOINT,
                model: ENV_MODEL,
                prefix: body.inputs,
                suffix: ''
            });
            res.status(200).send({ generated_text: ai });
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