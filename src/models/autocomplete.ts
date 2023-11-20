import axios from 'axios';
import { ollamaTokenGenerator } from '../modules/ollamaTokenGenerator';

export async function autocomplete(args: {
    endpoint: string,
    model: string,
    prompt: string
}) {

    // Calculate url
    let url = args.endpoint;
    if (url.endsWith('/')) {
        url = url.slice(url.length - 1);
    }
    url = url + '/api/generate';

    // Calculate arguments
    let data = {
        model: args.model,
        prompt: args.prompt,
        raw: true,
        options: {
            num_predict: 256
        }
    }

    // Receiving tokens
    let res = '';
    for await (let tokens of ollamaTokenGenerator(url, data)) {
        console.warn(tokens);
        res += tokens.response;
    }

    return res;
}