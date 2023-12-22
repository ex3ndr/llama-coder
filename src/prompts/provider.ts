import vscode from 'vscode';
import { info, warn } from '../modules/log';
import { autocomplete } from './autocomplete';
import { preparePrompt } from './preparePrompt';
import { AsyncLock } from '../modules/lock';
import { getFromPromptCache, setPromptToCache } from './promptCache';
import { isNotNeeded, isSupported } from './filter';
import { ollamaCheckModel } from '../modules/ollamaCheckModel';
import { ollamaDownloadModel } from '../modules/ollamaDownloadModel';
import { config } from '../config';

export class PromptProvider implements vscode.InlineCompletionItemProvider {

    lock = new AsyncLock();
    statusbar: vscode.StatusBarItem;

    constructor(statusbar: vscode.StatusBarItem) {
        this.statusbar = statusbar;
    }

    async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined | null> {

        try {

            // Ignore unsupported documents
            if (!isSupported(document)) {
                info(`Unsupported document: ${document.uri.toString()} ignored.`);
                return;
            }

            // Ignore if not needed
            if (isNotNeeded(document, position, context)) {
                info('No inline completion required');
                return;
            }

            // Ignore if already canceled
            if (token.isCancellationRequested) {
                info(`Canceled before AI completion.`);
                return;
            }

            // Execute in lock
            return await this.lock.inLock(async () => {

                // Prepare context
                let prepared = await preparePrompt(document, position, context);
                if (token.isCancellationRequested) {
                    info(`Canceled before AI completion.`);
                    return;
                }

                // Result
                let res: string | null = null;

                // Check if in cache
                let cached = getFromPromptCache({
                    prefix: prepared.prefix,
                    suffix: prepared.suffix
                });

                // If not cached
                if (cached === undefined) {

                    // Config
                    let inferenceConfig = config.inference;
                    // let config = vscode.workspace.getConfiguration('inference');
                    // let endpoint = config.get('endpoint') as string;
                    // let model = config.get('model') as string;
                    // let maxLines = config.get('maxLines') as number;
                    // let maxTokens = config.get('maxTokens') as number;
                    // let temperature = config.get('temperature') as number;
                    // if (endpoint.endsWith('/')) {
                    //     endpoint = endpoint.slice(0, endpoint.length - 1);
                    // }

                    // Update status
                    this.statusbar.text = `$(sync~spin) Llama Coder`;
                    try {

                        // Check model exists
                        let modelExists = await ollamaCheckModel(inferenceConfig.endpoint, inferenceConfig.modelName);
                        if (token.isCancellationRequested) {
                            info(`Canceled after AI completion.`);
                            return;
                        }

                        // Download model if not exists
                        if (!modelExists) {
                            this.statusbar.text = `$(sync~spin) Downloading`;
                            await ollamaDownloadModel(inferenceConfig.endpoint, inferenceConfig.modelName);
                            this.statusbar.text = `$(sync~spin) Llama Coder`;
                        }
                        if (token.isCancellationRequested) {
                            info(`Canceled after AI completion.`);
                            return;
                        }

                        // Run AI completion
                        info(`Running AI completion...`);
                        res = await autocomplete({
                            prefix: prepared.prefix,
                            suffix: prepared.suffix,
                            endpoint: inferenceConfig.endpoint,
                            model: inferenceConfig.modelName,
                            format: inferenceConfig.modelFormat,
                            maxLines: inferenceConfig.maxLines,
                            maxTokens: inferenceConfig.maxTokens,
                            temperature: inferenceConfig.temperature,
                            canceled: () => token.isCancellationRequested,
                        });
                        info(`AI completion completed: ${res}`);

                        // Put to cache
                        setPromptToCache({
                            prefix: prepared.prefix,
                            suffix: prepared.suffix,
                            value: res
                        });
                    } finally {
                        this.statusbar.text = `$(chip) Llama Coder`;
                    }
                } else {
                    if (cached !== null) {
                        res = cached;
                    }
                }
                if (token.isCancellationRequested) {
                    info(`Canceled after AI completion.`);
                    return;
                }

                // Return result
                if (res && res.trim() !== '') {
                    return [{
                        insertText: res,
                        range: new vscode.Range(position, position),
                    }];
                }

                // Nothing to complete
                return;
            });
        } catch (e) {
            warn('Error during inference:', e);
        }
    }
}