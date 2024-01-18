const Router = require('express');

const router = new Router();
const controller = require('../controllers/Controller');
const {body} = require('express-validator');
const authMiddleware = require('../middleware/auth_middleware');

router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 8, max: 32}),
controller.registration);


router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/activate/:link', controller.activate);
router.get('/refresh', controller.refresh);
router.get('/users', authMiddleware, controller.getUsers); 

module.exports = router