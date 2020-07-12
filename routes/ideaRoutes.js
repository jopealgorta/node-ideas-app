const express = require('express');
const ideaController = require('./../controllers/ideaController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(ideaController.getIdeas)
    .post(ideaController.createIdea);

router
    .route('/:id')
    .get(ideaController.getIdea)
    .patch(ideaController.updateIdea)
    .delete(ideaController.deleteIdea);

router.route('/:id/like').patch(authController.protect, ideaController.like);
router.get('/:id/user', ideaController.getMyIdeas);

router
    .route('/:id/comments')
    .get(ideaController.getComments)
    .post(ideaController.createComment);

module.exports = router;
