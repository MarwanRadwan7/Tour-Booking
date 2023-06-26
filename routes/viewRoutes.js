const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.use('/tour/:slug', viewController.getTour);
router.use('/login', viewController.getLoginForm);

module.exports = router;
