import vscode from 'vscode';

class Config {

    // Inference
    get inference() {
        let config = this.#config;

        // Load endpoint
        let endpoint = (config.get('endpoint') as string).trim();
        if (endpoint.endsWith('/')) {
            endpoint = endpoint.slice(0, endpoint.length - 1).trim();
        }
        if (endpoint === '') {
            endpoint = 'http://127.0.0.1:11434';
        }

        // Load general paremeters
        let maxLines = config.get('maxLines') as number;
        let maxTokens = config.get('maxTokens') as number;
        let temperature = config.get('temperature') as number;

        // Load model
        let modelName = config.get('model') as string;
        let modelFormat: 'codellama' | 'deepseek' = 'codellama';
        if (modelName === 'custom') {
            modelName = config.get('custom.model') as string;
            modelFormat = config.get('cutom.format') as 'codellama' | 'deepseek';
        } else {
            if (modelName.startsWith('deepseek-coder')) {
                modelFormat = 'deepseek';
            }
        }

        return {
            endpoint,
            maxLines,
            maxTokens,
            temperature,
            modelName,
            modelFormat
        };
    }

    get #config() {
        return vscode.workspace.getConfiguration('inference');
    };
}

export const config = new Config();