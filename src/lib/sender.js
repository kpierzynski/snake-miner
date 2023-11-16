import { database } from "./db.js"

import Game from "./models/gameSchema.js"

async function send(logs) {
    console.log("SENDING PLACEHOLDER")

    const db = await database()
    const game = new Game({steps: logs});

    await game.save();
}

export { send }