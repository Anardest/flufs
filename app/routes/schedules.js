const { Router } = require('express');
const router = Router();
const ApiResponse = require('../utils/apiResponse');
const Validator = require('../utils/validator');
const knex = require('../database');
const dbFunc = require('../utils/dataBaseChecker');

router.post('/create', async (req, res) => {
    try {
        const { group_id, subject_id, start_time, end_time } = req.body;
        await dbFunc.checkExistence('groups', 'group_id', group_id, 'Группа');
        await dbFunc.checkExistence('subjects', 'subject_id', subject_id, 'Предмет');

        if (!Validator.isString(start_time) || !Validator.isString(end_time)) {
            return ApiResponse.error(res, 'Время начала и окончания должно быть в формате строки.', null, 400);
        }

        const startTime = new Date(start_time);
        const endTime = new Date(end_time);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
            return ApiResponse.error(res, 'Неверный формат времени или время начала позже времени окончания.', null, 400);
        }

        const [newSchedule] = await knex('schedules')
            .insert({
                group_id,
                subject_id,
                start_time: startTime,
                end_time: endTime
            })
            .returning('*');
        
        return ApiResponse.success(res, newSchedule, 'Урок успешно добавлен в расписание.', 201);

    } catch (error) {
        return ApiResponse.error(res, 'Не удалось добавить урок в расписание', error.message, 500);
    }
});

router.post('/:id/attendance', async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const schedule = await dbFunc.checkExistence('schedules', 'schedule_id', scheduleId, 'Расписание');
        const { attendanceList } = req.body;
        if (!Validator.isArray(attendanceList)) {
            return ApiResponse.error(res, 'Список посещаемости должен быть массивом.', null, 400);
        }

        // Получаем всех студентов, которые должны быть на этом уроке
        const groupStudents = await knex('students')
            .where({ group_id: schedule.group_id })
            .select('student_id');

        const validStudentIds = new Set(groupStudents.map(student => student.student_id));

        const recordsToInsert = [];
        for (const record of attendanceList) {
            if (!record.student_id || typeof record.is_present === 'undefined' || !validStudentIds.has(record.student_id)) {
                return ApiResponse.error(res, `Неверные данные для студента с ID: ${record.student_id} или он не принадлежит к группе.`, null, 400);
            }
            recordsToInsert.push({
                schedule_id: scheduleId,
                student_id: record.student_id,
                is_present: record.is_present
            });
        }

        await knex.transaction(async (trx) => {
            // Удаляем старые записи посещаемости, если они есть
            await trx('attendance').where({ schedule_id: scheduleId }).del();
            // Вставляем новые записи
            if (recordsToInsert.length > 0) {
                await trx('attendance').insert(recordsToInsert);
            }
        });

        return ApiResponse.success(res, null, 'Посещаемость успешно отмечена.');

    } catch (error) {
        return ApiResponse.error(res, 'Не удалось отметить посещаемость', error, 500);
    }
});

router.get('/:id/get', async (req, res) => {
    try {
        const scheduleId = parseInt(req.params.id, 10);

        // 1. Проверяем существование урока
        const schedule = await dbFunc.checkExistence('schedules', 'schedule_id', scheduleId, 'Расписание');

        // 2. Получаем основную информацию об уроке, присоединяя названия группы и предмета
        const scheduleDetails = await knex('schedules')
            .join('groups', 'schedules.group_id', '=', 'groups.group_id')
            .join('subjects', 'schedules.subject_id', '=', 'subjects.subject_id')
            .where('schedules.schedule_id', scheduleId)
            .first()
            .select(
                'schedules.schedule_id',
                'schedules.start_time',
                'schedules.end_time',
                'groups.group_id',
                'groups.group_name',
                'subjects.subject_id',
                'subjects.subject_name'
            );

        // 3. Получаем список студентов и их посещаемость для этого урока
        const attendanceList = await knex('attendance')
            .join('students', 'attendance.student_id', '=', 'students.student_id')
            .where('attendance.schedule_id', scheduleId)
            .select(
                'attendance.is_present',
                'students.student_id',
                'students.first_name',
                'students.last_name'
            );

        // 4. Формируем финальный объект ответа
        const responseData = {
            ...scheduleDetails,
            attendance: attendanceList
        };

        return ApiResponse.success(res, responseData, 'Данные об уроке успешно получены.');

    } catch (error) {
        console.error('Ошибка при получении данных об уроке:', error.message);
        return ApiResponse.error(res, 'Не удалось получить данные об уроке', error.message, 500);
    }
});

module.exports = router;