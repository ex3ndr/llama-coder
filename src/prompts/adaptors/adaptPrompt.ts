export function adaptPrompt(args: { model: string, prefix: string, suffix: string }): { prompt: string, stop: string[] } {

    // Starcoder format
    if (args.model.startsWith('deepseek-coder')) {

        if (args.suffix.length < 1000) {
            return {
                prompt: args.prefix,
                stop: [`<END>`]
            };
        }

        return {
            prompt: `<｜fim▁begin｜>${args.prefix}<｜fim▁hole｜>${args.suffix}<｜fim▁end｜>`,
            stop: [`<｜fim▁begin｜>`, `<｜fim▁hole｜>`, `<｜fim▁end｜>`, `<END>`]
        };
    }

    // Codellama format
    return {
        prompt: `<PRE> ${args.prefix} <SUF>${args.suffix} <MID>`,
        stop: [`<PRE>`, `<SUF>`, `<MID>`, `<END>`]
    };
}