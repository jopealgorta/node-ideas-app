const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide an email and a password.'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password!'
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
        });

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
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

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ status: 'success' });
};

exports.signup = async (req, res, next) => {
    try {
        if (req.file) req.body.photo = req.file.filename;
        const user = await User.create(req.body);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });

        user.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
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

exports.protect = async (req, res, next) => {
    let token;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        // return res.status(401).json({
        //     status: 'fail',
        //     message: 'You are not logged in! Please login to get access.'
        // });
        console.log('Entreee');
        return res.redirect('/error');
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        console.log('Entreee');
        return res.redirect('/error');
    }
    // return res.status(401).json({
    //     status: 'fail',
    //     message: 'The user no longer exists.'
    // });

    if (currentUser.changedPasswordAfter(decoded.iat))
        // return res.status(401).json({
        //     status: 'fail',
        //     message: 'User changed password recently. Please login again.'
        // });
        return res.redirect('/error');

    req.user = currentUser;
    next();
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            const currentUser = await User.findById(decoded.id);

            if (!currentUser) return next();

            if (currentUser.changedPasswordAfter(decoded.iat)) return next();

            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = async (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: `You don't have permission to perform this action`
            });
        }
        next();
    };
};

exports.resetPassword = async (req, res, next) => {
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            passwordResetToken: hashToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user)
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid token or has expired.'
            });

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
            // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });

        user.password = undefined; // Hide password from output

        res.status(200).json({
            status: 'success',
            token,
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

exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user)
            return res.status(400).json({
                status: 'fail',
                message: "You're not logged in. Please login again!"
            });

        if (!(await user.correctPassword(req.body.currentPassword, user.password)))
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid current password'
            });

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
            // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });

        user.password = undefined; // Hide password from output

        res.status(200).json({
            status: 'success',
            token,
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
