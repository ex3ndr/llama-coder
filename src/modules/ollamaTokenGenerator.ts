import { lineGenerator } from "./lineGenerator";

export type OllamaToken = {
    model: string,
    response: string,
    done: boolean
}

export async function* ollamaTokenGenerator(url: string, data: any): AsyncGenerator<OllamaToken> {
    for await (let line of lineGenerator(url, data)) {
        let parsed = JSON.parse(line) as OllamaToken;
        yield parsed;
    }
}