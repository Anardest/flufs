class ApiResponse {
    /**
     * Успешный ответ
     * @param {Response} res - Express response object
     * @param {*} data - Данные для ответа
     * @param {string} message - Сообщение
     * @param {number} statusCode - HTTP статус код
     */
    static success = (res, data = null, message = 'Success', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    };

    /**
     * Ошибка
     * @param {Response} res - Express response object
     * @param {Error|string} error - Объект ошибки или сообщение
     * @param {number} statusCode - HTTP статус код
     * @param {string} code - Код ошибки (опционально)
     */
    static error = (res, message = 'Error', details = null, statusCode = 500) => {
        return res.status(statusCode).json({
            success: false,
            message,
            details,
            timestamp: new Date().toISOString()
        });
    };
};

module.exports = ApiResponse;