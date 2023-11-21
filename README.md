# Llama Coder

Llama Coder is a better and self-hosted Github Copilot replacement for VS Studio Code. Llama Coder uses [Ollama](https://ollama.ai) and codellama to provide autocomplete that runs on your hardware. Works best with Mac M1/M2/M3 or with RTX 4090.

## Features
* 🚀 As good as Copilot
* ⚡️ Fast. Works well on consumer GPUs. RTX 4090 is recommended for best performance.
* 🔐 No telemetry or tracking
* 🔬 Works with any language coding or human one.

## Recommended hardware

Minimum required RAM: 16GB is a minimum, more is better since even smallest model takes 5GB of RAM.
The best way: dedicated machine with RTX 4090. Install [Ollama](https://ollama.ai) on this machine and configure endpoint in extension settings to offload to this machine.
Second best way: run on MacBooc M1/M2/M3 with enougth RAM (more == better, but 10gb extra would be enougth).
For windows notebooks: it runs good with decent GPU, but dedicated machine with a good GPU is recommended. Perfect if you have a dedicated gaming PC.

## Local Installation

Install [Ollama](https://ollama.ai) on local machine and then launch the extension in VSCode, everything should work as it is.

## Remote Installation

Install [Ollama](https://ollama.ai) on dedicated machine and configure endpoint to it in extension settings. Ollama usually uses port 11434 and binds to `127.0.0.1`, to change it you should set `OLLAMA_HOST` to `0.0.0.0`.

## Models

Currently Llama Coder supports only Codellama. Model is quantized in different ways, but our tests shows that `q4` is an optimal way to run network. When selecting model the bigger the model is, it performs better. Always pick the model with the biggest size and the biggest possible quantization for your machine. Default one is `codellama:7b-code-q4_K_M` and should work everywhere, `codellama:34b-code-q4_K_M` is the best possible one.

| Name                      | RAM/VRAM | Notes |
|---------------------------|----------|-------|
| codellama:7b-code-q4_K_M  | 5GB      |       |
| codellama:7b-code-q6_K    | 6GB      | m     |
| codellama:7b-code-fp16    | 14GB     | g     |
| codellama:13b-code-q4_K_M | 10GB     |       |
| codellama:13b-code-q6_K   | 14GB     | m     |
| codellama:34b-code-q4_K_M | 24GB     |       |
| codellama:34b-code-q6_K   | 32GB     | m     |

* m - slow on MacOS
* g - slow on older NVidia cards (pre 30xx)

## License

MIT
