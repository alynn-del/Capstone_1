const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/users");
const verifyToken = require('../middleware/verifyToken'); 

router.post("/signup", usersCtrl.signup);
router.post("/login", usersCtrl.login);
router.put('/', verifyToken, usersCtrl.update);
router.delete('/', verifyToken, usersCtrl.deleteAccount);

module.exports = router;
