const Validator = {
    // Проверяет, что значение определено (не null и не undefined)
    isDefined(value) {
      return value !== null && value !== undefined;
    },
  
    // Проверяет, что значение — строка (и не пустая, если нужно)
    isString(value, minLength = 0) {
      return typeof value === 'string' && value.length >= minLength;
    },
  
    // Проверяет, что значение — число (и в нужном диапазоне, если указано)
    isNumber(value, min = -Infinity, max = Infinity) {
      return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
    },
  
    // Проверяет, что значение — целое число
    isInteger(value, min = -Infinity, max = Infinity) {
      return this.isNumber(value, min, max) && Number.isInteger(value);
    },
  
    // Проверяет, что значение — boolean
    isBoolean(value) {
      return typeof value === 'boolean';
    },
  
    // Проверяет, что значение — массив (и не пустой, если нужно)
    isArray(value, minLength = 0) {
      return Array.isArray(value) && value.length >= minLength;
    },
  
    // Проверяет, что значение — объект (и не null)
    isObject(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    },
  
    // Проверяет ID (число или строка, которую можно привести к числу)
    validateId(value) {
      if (!this.isDefined(value)) {
        throw new Error('ID is required');
      }
      const num = Number(value);
      if (!this.isNumber(num) || !this.isInteger(num, 1)) {
        throw new Error('ID must be a positive integer');
      }
      return num;
    },
  };

  module.exports = Validator;
  
// // Проверка числа
// if (!Validator.isNumber(someValue)) {
//     throw new Error('Value must be a number');
//   }
  
//   // Проверка ID
//   try {
//     const id = Validator.validateId(req.params.id);
//     console.log('Valid ID:', id);
//   } catch (err) {
//     console.error('Validation error:', err.message);
//     res.status(400).json({ error: err.message });
//   }
  