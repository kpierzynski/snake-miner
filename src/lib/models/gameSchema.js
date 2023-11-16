import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    steps: [{
        score: {
            type: Number,
            required: true,
            default: 0,
        },
        food: {
            x: {
                type: Number,
                required: true,
            },
            y: {
                type: Number,
                required: true,
            },
        },
        snake: {
            head: {
                x: {
                    type: Number,
                    required: true,
                },
                y: {
                    type: Number,
                    required: true,
                },
            },
            tail: [{
                x: {
                    type: Number,
                    required: true,
                },
                y: {
                    type: Number,
                    required: true,
                },
            }],
            direction: {
                type: String,
                required: true,
            }
        }
    }]
});

const GameSchema = mongoose.model('Game', gameSchema);

export default GameSchema;