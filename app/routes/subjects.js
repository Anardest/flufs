const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');
const dbFunc = require('../utils/dataBaseChecker');

router.get('/get_all', async (req, res) => {
    try {
        const subjects = await knex('subjects').select('*');
        return ApiResponse.success(res, subjects);
    } catch (error) {
        return ApiResponse.error(res, '', error);
    }
});

router.get('/:id/get', async (req, res) => {
    try {
        const subjectID = req.params.id;
        const subject = await dbFunc.checkExistence('subjects', 'subject_id', subjectID, 'предмет');
        return ApiResponse.success(res, subject);

    } catch (error) {
        return ApiResponse.error(res, '', error);
    }
});

router.post('/create', async (req, res) => {
    try {
        const { subject_name } = req.body;
        if (!Validator.isString(subject_name)) {
            return ApiResponse.error(res, `${subject_name} - должен быть строкой.`);
        }
        const [newSubject] = await knex('subjects')
            .insert({ subject_name: subject_name })
            .returning('*');
        
        return ApiResponse.success(res, newSubject);
    } catch (error) {
        // Проверяем, является ли ошибка нарушением уникальности (PostgreSQL)
        if (error.code === '23505') {
            return ApiResponse.error(res, 'Предмет с таким именем уже существует.', error, 409); // 409 Conflict
        }

        return ApiResponse.error(res, 'Ошибка создания предмета', error);
    }
});

router.put('/:id/edit', async (req, res) => {
    try {
        const subjectId = req.params.id;
        const subject = await dbFunc.checkExistence('subjects', 'subject_id', subjectId, 'предмет');

        const { subject_name } = req.body;
        if (!Validator.isString(subject_name)) {
            return ApiResponse.error(res, 'Неверный формат имени', `${subject_name}`);
        }

        const updatedCount = await knex('subjects')
            .where({ subject_id: subjectId })
            .update({ subject_name: subject_name });

        // Получаем обновленную запись для возврата в ответе
        const [updatedSubject] = await knex('subjects').where({ subject_id: subjectId }).select('*');
        
        return ApiResponse.success(res, updatedSubject, 'Предмет успешно изменён.', 201);

    } catch (error) {
        return ApiResponse.error(res, 'Ошибка изменения предмета', error);
    }
});

module.exports = router;