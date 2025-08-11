const knex = require('../database');
const Validator = require('./validator');

/**
 * Функция проверяет валидность ID и существование студента в БД.
 * @param {string|number} studentId - ID студента.
 * @returns {Promise<object>} - Промис, возвращающий объект студента.
 * @throws {Error} - Выбрасывает ошибку, если ID невалиден или студент не найден.
 */
async function checkStudent (studentId) {
    const parsedStudentId = parseInt(studentId, 10);
    
    // Проверяем, является ли ID числом.
    if (!Validator.isInteger(parsedStudentId)) {
        throw new Error('ID студента должен быть числом.');
    }

    // Ищем студента в БД.
    // Обратите внимание на исправленную опечатку: tudent_id -> student_id.
    const student = await knex('students')
        .where({ student_id: parsedStudentId })
        .first(); // Используем .first() для получения одного объекта или undefined

    if (!student) {
        throw new Error('Студент не найден.');
    }
    
    return student;
} 

module.exports = {
    checkStudent,
};