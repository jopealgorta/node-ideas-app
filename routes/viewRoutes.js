const express = require('express');
const path = require('path');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/login', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/signup', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/idea', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/chat', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/chats', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/create-idea', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/my-ideas', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/liked-ideas', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/me', authController.protect, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});
module.exports = router;
