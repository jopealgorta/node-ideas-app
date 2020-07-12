const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        summary: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            maxlength: 300,
            trim: true,
            default: ''
        },
        user: {
            ref: 'User',
            type: mongoose.Types.ObjectId,
            required: true
        },
        likeCounter: {
            type: Number,
            default: 0
        },
        comments: [
            {
                comment: {
                    type: String
                },
                user: {
                    ref: 'User',
                    type: mongoose.Types.ObjectId
                },
                createdAt: {
                    type: Date,
                    default: Date.now()
                }
            }
        ],
        category: {
            type: String,
            enum: ['IT', 'Deportes', 'Economia', 'Programacion', 'Politica', 'Otros'],
            default: 'Otros'
        }
    },
    {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        },
        timestamps: true
    }
);

ideaSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo -_id'
    }).populate({
        path: 'comments.user',
        select: 'name photo -_id'
    });
    next();
});

module.exports = mongoose.model('Idea', ideaSchema);
