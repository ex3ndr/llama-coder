export async function* lineGenerator(url: string, data: any, bearerToken: string): AsyncGenerator<string> {
    // Request
    const controller = new AbortController();
    let res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: bearerToken ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          } : {
            'Content-Type': 'application/json',
          },
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
        throw Error('Unable to connect to backend');
    }

    // Reading stream
    let stream = res.body.getReader();
    const decoder = new TextDecoder();
    let pending: string = '';
    try {
        while (true) {
            const { done, value } = await stream.read();

            // If ended
            if (done) {
                if (pending.length > 0) { // New lines are impossible here
                    yield pending;
                }
                break;
            }

            // Append chunk
            let chunk = decoder.decode(value);
            console.warn(chunk);
            pending += chunk;

            // Yield results 
            while (pending.indexOf('\n') >= 0) {
                let offset = pending.indexOf('\n');
                yield pending.slice(0, offset);
                pending = pending.slice(offset + 1);
            }
        }
    } finally {
        stream.releaseLock();
        if (!stream.closed) { // Stop generation
            await stream.cancel();
        }
        controller.abort();
    }
}