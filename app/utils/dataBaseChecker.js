const Validator = require('../utils/validator');
const knex = require('../database');

/**
 * Универсальная функция для проверки существования записи в любой таблице по ID.
 * @param {string} tableName - Имя таблицы.
 * @param {string} idColumnName - Имя столбца с ID.
 * @param {string|number} idValue - Значение ID для поиска.
 * @param {string} entityName - Имя сущности для сообщения об ошибке (например, 'Студент', 'Группа').
 * @returns {Promise<object>} - Промис, возвращающий найденный объект.
 * @throws {Error} - Выбрасывает ошибку, если ID невалиден или запись не найдена.
 */
async function checkExistence (tableName, idColumnName, idValue, entityName = 'сущность') {
    const parsedId = parseInt(idValue, 10);

    if (!Validator.isInteger(parsedId, 1)) {
        throw new Error(`ID "${entityName}" должен быть числом.`);
    }

    const entity = await knex(tableName)
        .where({ [idColumnName]: parsedId })
        .first();

    if (!entity) {
        throw new Error(`"${entityName}" не найден.`);
    }

    return entity;
}

module.exports = {
    checkExistence
}