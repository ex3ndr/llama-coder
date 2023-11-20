import type vscode from 'vscode';
import { ollamaTokenGenerator } from '../modules/ollamaTokenGenerator';
import { countLines, trimEndBlank } from '../modules/text';
import { info } from '../modules/log';

export function isSupported(doc: vscode.TextDocument) {
    return doc.uri.scheme === 'file' && doc.languageId === 'typescript';
}

export async function autocomplete(args: {
    endpoint: string,
    model: string,
    prefix: string,
    suffix: string,
    canceled?: () => boolean,
}) {

    // Calculate url
    let url = args.endpoint;
    if (url.endsWith('/')) {
        url = url.slice(0, url.length - 1);
    }
    url = url + '/api/generate';

    // Calculate arguments
    let data = {
        model: args.model,
        prompt: `<PRE> ${args.prefix} <SUF>${args.suffix} <MID>`, // Codellama format
        raw: true,
        options: {
            num_predict: 256
        }
    };

    // Receiving tokens
    let res = '';
    for await (let tokens of ollamaTokenGenerator(url, data)) {
        if (args.canceled && args.canceled()) {
            break;
        }
        res += tokens.response;
        if (countLines(res) > 3) {
            info('Too many lines, breaking.');
            break;
        }
    }

    // Trim empty lines
    // res = trimEndBlank(res);

    return res;
}