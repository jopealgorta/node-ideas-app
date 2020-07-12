const Message = require('./../models/messageModel');

exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            idea: req.params.idea
        }).sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: {
                messages
            }
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.createMessage = async (req, res, next) => {
    try {
        const message = await Message.create({
            idea: req.params.idea, 
            from: req.params.from,
            message: req.body.message
        });

        res.status(201).json({
            status: 'success',
            data: {
                message
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'An error has occured.'
        });
    }
};

exports.deleteMessage = async (req, res, next) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'No idea found with that id.'
        });
    }
};
