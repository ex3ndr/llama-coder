export async function* lineGenerator(url: string, data: any): AsyncGenerator<string> {

    // Request
    let res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!res.ok || !res.body) {
        const json = await res.json();
        console.warn(json);
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
            pending += decoder.decode(value);

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
            stream.cancel();
        }
    }
}