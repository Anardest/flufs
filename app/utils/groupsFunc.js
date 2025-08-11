const Validator = require('../utils/validator');
const knex = require('../database');


/**
 * Функция проверяет валидность ID и существование группы в БД.
 * @param {string|number} grouptId - ID группы.
 * @returns {Promise<object>} - Промис, возвращающий объект студента.
 * @throws {Error} - Выбрасывает ошибку, если ID невалиден или группа не найдена.
 * 
 */
async function checkGroup (groupId) {
    const parsedGroupId = parseInt(groupId, 10);
    if (!Validator.isInteger(parsedGroupId)) {
        throw new Error('ID группы должен быть числом.')
    }
    const group = await knex('groups')
        .where({ group_id: parsedGroupId })
        .first();
    
    if (!group) {
        throw new Error('Группа не найдена')
    }

    return group;
} 

module.exports = {
    checkGroup,
}