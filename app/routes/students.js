const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');
const studentFunctions = require('../utils/studentsFunc');
const groupsFunctions = require('../utils/groupsFunc');

router.put('/:id/edit', async (req, res) => {
    try {
        const studentId = req.params.id;
        const existingStudent = await studentFunctions.checkStudent(studentId);

        const { first_name, last_name, group_id } = req.body;
        
        const updates = {};
        if (first_name) {
            updates.first_name = first_name;
        }
        if (last_name) {
            updates.last_name = last_name;
        }
        if (group_id) {
            const existingGroup = await groupsFunctions.checkGroup(group_id);
            updates.group_id = group_id;
        }
        
        // Проверяем, есть ли что-то для обновления
        if (Object.keys(updates).length === 0) {
            return ApiResponse.error(res, 'Нет данных для обновления', null, 400);
        }

        const updatedCount = await knex('students')
            .where({ student_id: studentId })
            .update(updates);
        
        if (updatedCount.length === 0) {
            return ApiResponse.error(res, 'Студент с указанным ID не найден');
        }

        // Получаем обновленную запись для возврата в ответе
        const [updatedStudent] = await knex('students').where({ student_id: studentId }).select('*');

        return ApiResponse.success(res, updatedStudent, `Студент с ID ${studentId} успешно обновлен.`);
    } catch (error) {
        return ApiResponse.error(res, 'Не удалось обновить студента', error.message, 500);
    }
});

router.delete('/:id/delete', async (req, res) => {
    try {
        const studentId = req.params.id;
        await studentFunctions.checkStudent(studentId);

        const deletedCount = await knex('students')
            .where({ student_id: studentId })
            .del();
        
        if (deletedCount === 0) {
            return ApiResponse.error(res, 'Студент не найден', null, 400);
        }

        return ApiResponse.success(res, null, 'Студент удалён');
    } catch (error) {
        return ApiResponse.error(res, 'Не удалось удалить студента', error.message, 500);
    }
});

module.exports = router;