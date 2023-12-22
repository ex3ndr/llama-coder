export type ModelFormat = 'codellama' | 'deepseek';

export function adaptPrompt(args: { format: ModelFormat, prefix: string, suffix: string }): { prompt: string, stop: string[] } {

    // Common non FIM mode
    // if (!args.suffix) {
    //     return {
    //         prompt: args.prefix,
    //         stop: [`<END>`]
    //     };
    // }

    // Starcoder FIM
    if (args.format === 'deepseek') {
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