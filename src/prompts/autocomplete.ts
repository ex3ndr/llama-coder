import type vscode from 'vscode';
import { ollamaTokenGenerator } from '../modules/ollamaTokenGenerator';
import { countLines, countSymbol, trimEndBlank } from '../modules/text';
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
        options: {
            num_predict: 256
        }
    };

    // Receiving tokens
    let res = '';
    let totalLines = 1;
    let blockStack: ('[' | '(' | '{')[] = [];
    outer: for await (let tokens of ollamaTokenGenerator(url, data)) {
        if (args.canceled && args.canceled()) {
            break;
        }

        // Block stack
        for (let c of tokens.response) {

            // Open block
            if (c === '[') {
                blockStack.push('[');
            } else if (c === '(') {
                blockStack.push('(');
            }
            if (c === '{') {
                blockStack.push('{');
            }

            // Close block
            if (c === ']') {
                if (blockStack.length > 0 && blockStack[blockStack.length - 1] === '[') {
                    blockStack.pop();
                } else {
                    info('Block stack error, breaking.');
                    break outer;
                }
            }
            if (c === ')') {
                if (blockStack.length > 0 && blockStack[blockStack.length - 1] === '(') {
                    blockStack.pop();
                } else {
                    info('Block stack error, breaking.');
                    break outer;
                }
            }
            if (c === '}') {
                if (blockStack.length > 0 && blockStack[blockStack.length - 1] === '{') {
                    blockStack.pop();
                } else {
                    info('Block stack error, breaking.');
                    break outer;
                }
            }

            // Append charater
            res += c;
        }

        // Update total lines
        totalLines += countSymbol(tokens.response, '\n');

        // Break if too many lines and on top level
        if (totalLines > 16 && blockStack.length === 0) {
            info('Too many lines, breaking.');
            break;
        }
    }

    // Remove <EOT>
    if (res.endsWith('<EOT>')) {
        res = res.slice(0, res.length - 5);
    }

    return res;
}