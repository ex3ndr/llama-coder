import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { autocomplete } from '../../prompts/autocomplete';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('should perform autocomplete', async () => {
		let endpoint = 'http://127.0.0.1:11434';
		let model = 'codellama:7b-code-q4_K_S'; // Lightweight llm for tests
		let maxLines = 16;
		let maxTokens = 256;
		let temperature = 0.2;
		let prompt = 'fun main(): ';
		let result = await autocomplete({
			endpoint,
			model,
			prefix: prompt,
			suffix: '',
			maxLines,
			maxTokens,
			temperature
		});
		console.warn(result);
	});
});
