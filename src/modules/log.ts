export type Logger = {
    info(msg: string): void;
};

let logger: Logger | null = null;

export function info(src: string) {
    if (logger) {
        logger.info(src);
    }
}

export function registerLogger(logger: Logger) {
    logger = logger;
}