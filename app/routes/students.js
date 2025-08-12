const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');
const dbFunc = require('../utils/dataBaseChecker');

router.put('/:id/edit', async (req, res) => {
    try {
        const studentId = req.params.id;
        const existingStudent = await dbFunc.checkExistence('students', 'student_id', studentId, 'студент')

        const { first_name, last_name, group_id } = req.body;
        
        const updates = {};
        if (first_name) {
            updates.first_name = first_name;
        }
        if (last_name) {
            updates.last_name = last_name;
        }
        if (group_id) {
            const existingGroup = await dbFunc.checkExistence('groups', 'group_id', groupId, 'группа')
            updates.group_id = group_id;
        }
        
        // Проверяем, есть ли что-то для обновления
        if (Object.keys(updates).length === 0) {
            return ApiResponse.error(res, 'Нет данных для обновления', null, 400);
        }

        const updatedCount = await knex('students')
            .where({ student_id: studentId })
            .update(updates);

        // Получаем обновленную запись для возврата в ответе
        const [updatedStudent] = await knex('students').where({ student_id: studentId }).select('*');

        return ApiResponse.success(res, updatedStudent, `Студент с ID ${studentId} успешно обновлен.`);
    } catch (error) {
        return ApiResponse.error(res, 'Не удалось обновить студента', error.message, 500);
    }
});

router.delete('/:id/force_delete', async (req, res) => {
    try {
        const studentId = req.params.id;
        const existingStudent = await dbFunc.checkExistence('students', 'student_id', studentId, 'студент')

        const deletedCount = await knex('students')
            .where({ student_id: studentId })
            .del();

        return ApiResponse.success(res, null, 'Студент удалён');
    } catch (error) {
        return ApiResponse.error(res, 'Не удалось удалить студента', error.message, 500);
    }
});

module.exports = router;