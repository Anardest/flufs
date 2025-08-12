const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');
const dbFunc = require('../utils/dataBaseChecker');

router.get('/get_all', async (req, res) => {
    try {
        const groups = await knex('groups').select('*');
        return ApiResponse.success(res, groups);
    } catch (error) {
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

router.get('/:id/get', async (req, res) => {
    try {
        const groupId = req.params.id;
        const existingGroup = await dbFunc.checkExistence('groups', 'group_id', groupId, 'группа')

        return ApiResponse.success(res, existingGroup);
    } catch (error) {
        console.error('Ошибка получения групп');
        return ApiResponse.error(res);
    }
});

router.put('/:id/edit', async (req, res) => {
    try {
        const groupId = req.params.id;
        const existingGroup = await dbFunc.checkExistence('groups', 'group_id', groupId, 'группа')

        const { group_name } = req.body;
        
        if (!Validator.isString(group_name)) {
            return ApiResponse.error(res, 'Имя должноб быть строкой', `${group_name}`);
        }

        const updatedCount = await knex('groups')
            .where({ group_id: groupId })
            .update({ group_name: group_name });
        
        if (updatedCount.length === 0) {
            return ApiResponse.error(res, 'Студент с указанным ID не найден');
        }

        // Получаем обновленную запись для возврата в ответе
        const [updatedGroup] = await knex('groups').where({ group_id: groupId }).select('*');

        return ApiResponse.success(res, updatedGroup, `Группа с ID ${groupId} успешно обновлена.`);
    } catch (error) {
        return ApiResponse.error(res, 'Не удалось обновить группу', error.message, 500);
    }
});

//Будем получать студентов в зависимости от ссылки
router.get('/:id/students', async (req, res) => {
    try {
        const groupId = req.params.id;
        const existingGroup = await dbFunc.checkExistence('groups', 'group_id', groupId, 'группа')

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
        const existingGroup = await dbFunc.checkExistence('groups', 'group_id', groupId, 'группа')

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
        const existingGroup = await dbFunc.checkExistence('groups', 'group_id', groupId, 'группа')

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