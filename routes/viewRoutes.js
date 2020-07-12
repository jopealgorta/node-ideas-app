const express = require('express');
const path = require('path');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/signup', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.use(authController.protect);

router.get('/idea', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/chat', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/chats', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/create-idea', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/my-ideas', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/liked-ideas', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/me', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});
module.exports = router;
