const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            {
                status: 'fail',
                message: 'No es una imagen, por favor suba una imagen!'
            },
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
    try {
        if (!req.file) return next();

        req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/${req.file.filename}`);
    } catch (err) {
        console.error(err);
    }
    next();
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const features = new APIFeatures(User.findById(req.params.id).populate('chats'), req.query)
            .filter()
            .sort()
            .limit()
            .paginate();
        // const docs = await features.query.explain();
        const user = await features.query;
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        if (req.file) req.body.photo = req.file.filename;

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getLikedIdeas = async (req, res, next) => {
    try {
        let user;
        if (req.query.popu) {
            user = await User.findById(req.params.id)
                .populate('likedIdeas')
                .select('likedIdeas');
        } else {
            user = await User.findById(req.params.id).select('likedIdeas');
        }
        const { likedIdeas } = user;
        res.status(200).json({
            status: 'success',
            data: {
                likedIdeas
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.addChat = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { chats: req.params.idea }
            },
            {
                new: true,
                runValidators: true
            }
        );
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        if (req.body.password || req.body.confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'This route is not for updating the password.'
            });
        }
        const body = {
            name: req.body.name,
            email: req.body.email
        };
        if (req.file) body.photo = req.file.filename;
        const user = await User.findByIdAndUpdate(req.user.id, body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
