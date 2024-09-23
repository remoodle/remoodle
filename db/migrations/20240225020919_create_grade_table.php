<?php

declare(strict_types=1);

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

final class CreateGradeTable extends AbstractMigration
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
        $table = $this->table('grades', ["id" => true]);
        $table
            ->addColumn('grade_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('moodle_id', 'integer', ['signed' => false, 'null' => false])

            ->addColumn('cmid', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            // ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('percentage', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('itemtype', 'string')
            ->addColumn('itemmodule', 'string', ['null' => true])
            ->addColumn('iteminstance', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('grademin', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('grademax', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('feedbackformat', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('graderaw', 'float', ['null' => true])
            ->addColumn('feedback', 'text', ['null' => true, 'limit' => MysqlAdapter::TEXT_MEDIUM])

            ->addForeignKey('moodle_id', 'moodle_users', 'moodle_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            // ->addForeignKey('cmid', 'course_modules', 'cmid', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addIndex(['moodle_id'], ['unique' => false])
            ->addIndex(['cmid'], ['unique' => false])
            ->addIndex(['moodle_id', 'grade_id'], ['unique' => true])
            ->addIndex(['course_id'], ['unique' => false])
            ->create();
    }
}
