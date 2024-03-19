<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateUserCourseAssignTable extends AbstractMigration
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
        $table = $this->table('user_course_assign', ["id" => false, 'primary_key' => ['moodle_id', 'course_id']]);

        $table
            ->addColumn('moodle_id', 'integer', ['signed' => false, 'null' => false])            
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])   
            ->addColumn('classification', 'enum', ['values' => ['inprogress', 'past', 'future'], 'null' => false])   
            
            ->addForeignKey('moodle_id', 'moodle_users', 'moodle_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            
            ->addIndex(['course_id'], ['unique' => false])
            ->addIndex(['moodle_id'], ['unique' => false])
            ->addIndex(['classification'], ['unique' => false])
            ->create();
    }
}
