<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateSearchItemTable extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $table = $this->table('search_items', ['id' => false, 'primary_key' => 'item_id']);
        $table
            ->addColumn('item_id', 'string', ['null' => false])
            ->addColumn('id_value', 'string', ['null' => false]) //at time not works for composite keys
            ->addColumn('id_column', 'string', ['null' => false]) //at time not works for composite keys
            ->addColumn('word_count', 'string', ['null' => false])
            ->addColumn('type', 'string', ['null' => false])

            ->addColumn("course_id", 'integer', ['null' => true, 'signed' => false])
            ->addColumn("moodle_id", 'integer', ['null' => true, 'signed' => false])

            ->addForeignKey('moodle_id', 'moodle_users', 'moodle_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])

            ->addIndex(['moodle_id'], ['name' => 'idx_moodle_id'])
            ->addIndex(['course_id'], ['name' => 'idx_course_id'])

            ->addIndex(['id_column', 'id_value'], [
                'name' => 'idx_column_value',
                'unique' => true
            ])

            ->addIndex(['item_id'], [
                'name' => 'idx_id',
                'unique' => true
            ])
            ->create();
    }
}
