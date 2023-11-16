import { MONGODB_URI } from '$env/static/private'
import mongoose from 'mongoose';

const db = {
    instance: null
}

const database = async () => {
    if( !db.instance )
        db.instance = await mongoose.connect(MONGODB_URI, {})

    return db.instance
}

export { database }