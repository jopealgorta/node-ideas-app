const Idea = require('./../models/ideaModel');
const User = require('./../models/userModel');

exports.getIdeas = async (req, res, next) => {
    try {
        const ideas = await Idea.find().sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: ideas.length,
            data: {
                ideas
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.createIdea = async (req, res, next) => {
    const newIdea = new Idea(req.body);
    try {
        await newIdea.save();
        await User.findByIdAndUpdate(req.body.user, { $push: { ideas: newIdea._id } });

        res.status(201).json({
            status: 'success',
            data: {
                idea: newIdea
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteIdea = async (req, res, next) => {
    try {
        await Idea.findByIdAndDelete(req.params.id);
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

exports.getIdea = async (req, res, next) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            res.status(400).json({
                status: 'fail',
                message: 'No idea found with that id.'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                idea
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Alto error'
        });
    }
};

exports.updateIdea = async (req, res, next) => {
    try {
        const idea = await Idea.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!idea) {
            res.status(400).json({
                status: 'fail',
                message: 'No idea found with that id.'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                idea
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getComments = async (req, res, next) => {
    try {
        const idea = await Idea.findById(req.params.id);
        const { comments } = idea;
        res.status(200).json({
            status: 'success',
            results: comments.length,
            data: {
                comments
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.createComment = async (req, res, next) => {
    try {
        const comment = {
            user: req.body.user,
            comment: req.body.comment,
            createdAt: Date.now()
        };
        await Idea.findByIdAndUpdate(req.params.id, {
            $push: {
                comments: { $each: [comment], $position: 0 }
            }
        });
        res.status(201).json({
            status: 'success',
            data: {
                comment
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.like = async (req, res, next) => {
    try {
        let liked = false;
        const like = await User.find({
            _id: req.user.id,
            likedIdeas: [req.params.id]
        });
        if (like.length === 0) {
            await User.findByIdAndUpdate(
                req.user.id,
                { $push: { likedIdeas: req.params.id } },
                { new: true }
            );
            liked = true;
        } else {
            await User.findByIdAndUpdate(
                req.user.id,
                { $pull: { likedIdeas: req.params.id } },
                { new: true }
            );
        }

        await Idea.findByIdAndUpdate(req.params.id, { $inc: { likeCounter: like.length === 0 ? 1 : -1 } });

        res.status(200).json({
            status: 'success',
            data: {
                liked
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getMyIdeas = async (req, res) => {
    try {
        const ideas = await Idea.find({ user: req.params.id });
        res.status(200).json({
            status: 'success',
            data: {
                ideas
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
