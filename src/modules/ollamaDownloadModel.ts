import { lineGenerator } from "./lineGenerator";
import { info } from "./log";

export async function ollamaDownloadModel(endpoint: string, model: string, bearerToken: string) {
    info('Downloading model from ollama: ' + model);
    for await (let line of lineGenerator(endpoint + '/api/pull', { name: model }, bearerToken)) {
        info('[DOWNLOAD] ' + line);
    }
}