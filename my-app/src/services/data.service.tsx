const socket = new WebSocket("wss://hometask.eg1236.com/game1/");

function parseResponse(res: string): string {
    console.log(res);
    const resArray = res.split(':');
    return resArray[1].trim();
}

export async function makeRequest(req: string): Promise<string> {
    return new Promise(function (resolve, reject) {
        socket.send(req);
        socket.onmessage = function (event) {
            resolve(parseResponse(event.data));
        };
    })
}

