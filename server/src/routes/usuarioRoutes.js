// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protegerRuta } = require('../middleware/auth');

// Base routes
router.get('/', protegerRuta, usuarioController.getUsers);
router.get('/s', protegerRuta, usuarioController.getUsersByServicio);
router.get('/:id', protegerRuta, usuarioController.getUserById);
router.put('/:id', protegerRuta, usuarioController.updateUser);

// Status management routes
router.put('/:id/toggle-status', protegerRuta, usuarioController.toggleUserStatus);
router.put('/:id/deactivate', protegerRuta, usuarioController.deactivateUser);
router.put('/:id/reactivate', protegerRuta, usuarioController.reactivateUser);
router.delete('/del/:id', protegerRuta, usuarioController.deleteUser);

module.exports = router;