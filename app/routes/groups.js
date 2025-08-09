const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');

router.get('/', async (req, res) => {
    try {
        const groups = await knex('groups').select('*');
        return ApiResponse.success(res, groups);
    } catch (error) {
        console.error('Ошибка получения групп');
        return ApiResponse.error(res);
    }
});

router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;
        if (!Validator.isString(name)) {
            return ApiResponse.error(res, 'Имя должно быть строкой');
        }
        const [newGroup] = await knex('groups').insert({
            group_name: name
        }).returning('*');

        ApiResponse.success(res, newGroup);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
});


module.exports = router;