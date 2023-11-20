import type vscode from 'vscode';

type Logger = {
    info(msg: string): void;
};

let logger: Logger | null = null;

export function registerLogger(channel: vscode.LogOutputChannel) {
    logger = {
        info(msg: string) {
            channel.appendLine(msg);
        }
    };
}

export function info(src: string) {
    if (logger) {
        logger.info(src);
    }
}