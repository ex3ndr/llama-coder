import type vscode from 'vscode';

type Logger = {
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
};

let logger: Logger | null = null;

export function registerLogger(channel: vscode.LogOutputChannel) {
    logger = channel;
}

export function info(message: string, ...args: any[]) {
    if (logger) {
        logger.info(message, ...args);
    }
}

export function warn(message: string, ...args: any[]) {
    if (logger) {
        logger.warn(message, ...args);
    }
}