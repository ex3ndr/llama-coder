import { autocomplete } from "./autocomplete";

describe('autocomplete', () => {
    it('should perform autocomplete', async () => {
        let endpoint = process.env.OLLAMA_ENDPOINT!;
        let model = 'codellama:13b-code-q6_K';
        let prompt = 'fun main(): ';
        let result = await autocomplete({
            endpoint,
            model,
            prompt
        });
        console.warn(result);
    });
});