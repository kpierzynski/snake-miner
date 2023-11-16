import { send } from '$lib/sender.js';

//this function accepts data via POST from front to backend inside application SvelteKit
export async function POST({request}) {
    console.log("POST +server.js")
    const data = await request.json()
    console.log(data)

    const result = await send(data);
    console.log(result)
    
    return new Response("OK")
}