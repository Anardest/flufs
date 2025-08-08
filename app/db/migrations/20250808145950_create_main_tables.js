/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema

    .createTable('groups', function(table) {
        table.increments('group_id').primary();
        table.string('group_name', 100).notNullable().unique();
    })

    .createTable('subjects', function(table) {
        table.increments('subject_id').primary();
        table.string('subject_name', 100).notNullable().unique();
    })

    // Создаем таблицу Students, которая ссылается на Groups
    .createTable('students', function(table) {
        table.increments('student_id').primary();
        table.string('first_name', 50).notNullable();
        table.string('last_name', 50).notNullable();
        // Создаем внешний ключ, ссылающийся на groups.group_id
        table.integer('group_id').unsigned().references('group_id').inTable('groups').onDelete('SET NULL');
    })

    // Создаем таблицу Schedules, которая ссылается на Groups и Subjects
    .createTable('schedules', function(table) {
        table.increments('schedule_id').primary();
        table.timestamp('start_time').notNullable();
        table.timestamp('end_time').notNullable();
        // Создаем внешние ключи
        table.integer('subject_id').unsigned().notNullable().references('subject_id').inTable('subjects').onDelete('CASCADE');
        table.integer('group_id').unsigned().notNullable().references('group_id').inTable('groups').onDelete('CASCADE');
    })

    // Создаем таблицу Homework, которая ссылается на Subjects
    .createTable('homework', function(table) {
      table.increments('homework_id').primary();
      table.string('title', 255).notNullable();
      table.text('description');
      table.date('due_date').notNullable();
      // Создаем внешний ключ
      table.integer('subject_id').unsigned().notNullable().references('subject_id').inTable('subjects').onDelete('CASCADE');
    })

    // Создаем таблицу Attendance, которая ссылается на Schedules и Students
    .createTable('attendance', function(table) {
      table.increments('attendance_id').primary();
      table.boolean('is_present').notNullable().defaultTo(false);
      // Создаем внешние ключи
      table.integer('schedule_id').unsigned().notNullable().references('schedule_id').inTable('schedules').onDelete('CASCADE');
      table.integer('student_id').unsigned().notNullable().references('student_id').inTable('students').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('attendance')
        .dropTableIfExists('homework')
        .dropTableIfExists('schedules')
        .dropTableIfExists('students')
        .dropTableIfExists('subjects')
        .dropTableIfExists('groups');
};
