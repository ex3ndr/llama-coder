export function adaptPrompt(args: { model: string, prefix: string, suffix: string | null }): { prompt: string, stop: string[] } {

    // Common non FIM mode
    if (!args.suffix) {
        return {
            prompt: args.prefix,
            stop: [`<END>`]
        };
    }

    // Starcoder FIM
    if (args.model.startsWith('deepseek-coder')) {
        return {
            prompt: `<｜fim▁begin｜>${args.prefix}<｜fim▁hole｜>${args.suffix}<｜fim▁end｜>`,
            stop: [`<｜fim▁begin｜>`, `<｜fim▁hole｜>`, `<｜fim▁end｜>`, `<END>`]
        };
    }

    // Codellama FIM
    return {
        prompt: `<PRE> ${args.prefix} <SUF>${args.suffix} <MID>`,
        stop: [`<PRE>`, `<SUF>`, `<MID>`, `<END>`]
    };
}