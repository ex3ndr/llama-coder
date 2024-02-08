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
    context: vscode.ExtensionContext;

    constructor(statusbar: vscode.StatusBarItem, context: vscode.ExtensionContext) {
        this.statusbar = statusbar;
        this.context = context;
    }

    async delayCompletion(delay: number, token: vscode.CancellationToken): Promise<boolean> {
        if (config.inference.delay < 0) {
            return false;
        }
        await new Promise(p => setTimeout(p, delay));
        if (token.isCancellationRequested) {
            return false;
        }
        return true;
    }

    async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined | null> {
        if (!await this.delayCompletion(config.inference.delay, token)) {
            return;
        }

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

                            // Check if user asked to ignore download
                            if (this.context.globalState.get('llama-coder-download-ignored') === inferenceConfig.modelName) {
                                info(`Ingoring since user asked to ignore download.`);
                                return;
                            }

                            // Ask for download
                            let download = await vscode.window.showInformationMessage(`Model ${inferenceConfig.modelName} is not downloaded. Do you want to download it? Answering "No" would require you to manually download model.`, 'Yes', 'No');
                            if (download === 'No') {
                                info(`Ingoring since user asked to ignore download.`);
                                this.context.globalState.update('llama-coder-download-ignored', inferenceConfig.modelName);
                                return;
                            }

                            // Perform download
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