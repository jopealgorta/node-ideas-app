const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        from: {
            ref: 'User',
            type: mongoose.Types.ObjectId,
            required: true
        },
        idea: {
            ref: 'Idea',
            type: mongoose.Types.ObjectId,
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date
        }
    },
    {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
);

messageSchema.index({ to: 1, from: 1 });

module.exports = mongoose.model('Message', messageSchema);
