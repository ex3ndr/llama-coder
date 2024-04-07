import { info } from "./log";

export async function ollamaCheckModel(endpoint: string, model: string, bearerToken: string) {
    // Check if exists
    let res = await fetch(endpoint + '/api/tags', {
      headers: bearerToken ? {
            Authorization: `Bearer ${bearerToken}`,
          } : {},
    });
    if (!res.ok) {
        info(await res.text());
        info(endpoint + '/api/tags');
        throw Error('Network response was not ok.');
    }
    let body = await res.json() as { models: { name: string }[] };
    if (body.models.find((v) => v.name === model)) {
        return true;
    } else {
        return false;
    }
}