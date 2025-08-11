const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');
const groupsFunctions = require('../utils/groupsFunc');

router.get('/get', async (req, res) => {
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

//Будем получать студентов в зависимости от ссылки
router.get('/:id/students', async (req, res) => {
    try {
        const groupId = req.params.id;
        const cheker = await groupsFunctions.checkGroup(groupId);

        const students = await knex('students')
            .where({ group_id: groupId })
            .select('student_id', 'first_name', 'last_name');

        if (students.length === 0) {
            return ApiResponse.success(res, [], 'Группа найдена, но студентов нет.')
        }
        return ApiResponse.success(res, students);

    } catch (error) {
        console.error('Ошибка получения студентов:', error);
        return ApiResponse.error(res, 'Ошибка получения студентов:', error);
    }
});

router.post('/:id/add_student', async (req, res) => {
    try {
        const groupId = req.params.id;
        const cheker = await groupsFunctions.checkGroup(groupId);

        const { first_name, last_name } = req.body;
        if (!Validator.isString(first_name) || !Validator.isString(last_name)) {
            return ApiResponse.error(res, 'Имя и фамилия должны быть строками', `Ответ: ${first_name} - ${last_name}`);
        }

        const [newStudent] = await knex('students')
            .insert({
                first_name: first_name,
                last_name: last_name,
                group_id: groupId
            }).returning('*');

        return ApiResponse.success(res, newStudent);
    } catch (error) {
        return ApiResponse.error(res, 'Ошибка создания студента', error);
    }
});

router.delete('/:id/force_delete', async (req, res) => {
    try {
        const groupId = req.params.id;
        const cheker = await groupsFunctions.checkGroup(groupId);

        const existingGroup = await groupsFunctions.checkGroup(groupId);

        await knex.transaction(async (trx) => {

            await trx('students')
                .where({ group_id: groupId })
                .del();
            
            await trx('groups')
                .where({ group_id: groupId })
                .del();
        });
        return ApiResponse.success(res, null, 'Группа и все студенты успешно удаленыю')
    } catch (error) {
        return ApiResponse.error(res, 'Не удалось удалить группу', error.message, 500);
    }
})



module.exports = router;