const express = require('express');
const messageController = require('./../controllers/messageController');

const router = express.Router();

router.route('/:idea/:from').post(messageController.createMessage);

router.get('/:idea', messageController.getMessages);

router.delete('/:id', messageController.deleteMessage);

module.exports = router;
