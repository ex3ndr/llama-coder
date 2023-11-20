import { ollamaTokenGenerator } from '../modules/ollamaTokenGenerator';
import { countLines, trimEndBlank } from '../modules/text';

export async function autocomplete(args: {
    endpoint: string,
    model: string,
    prefix: string,
    suffix: string
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
        prompt: args.prefix + args.suffix,
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
        if (countLines(res) > 3) {
            console.warn('break');
            break;
        }
    }

    // Trim empty lines
    res = trimEndBlank(res);

    return res;
}