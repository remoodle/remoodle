<?php

declare(strict_types=1);
use Phinx\Migration\AbstractMigration;

final class CreateUserSubmissionsTable extends AbstractMigration
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
        $table = $this->table('user_assignment_submission', ["id" => false, "primary_key" => ["moodle_id", "assignment_id"]]);
        $table
            ->addColumn('submission_id', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('timecreated', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('timemodified', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('submissionsenabled', 'boolean', ['null' => false])
            ->addColumn('extensionduedate', 'integer', ['signed' => false])
            ->addColumn('cansubmit', 'boolean', ['null' => false])
            ->addColumn('graded', 'boolean', ['null' => false])
            ->addColumn('moodle_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('assignment_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('submitted', 'boolean', ['default' => false])
            ->addForeignKey('moodle_id', 'moodle_users', 'moodle_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('assignment_id', 'assignments', 'assignment_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addIndex(['moodle_id'], ['unique' => false])
            ->addIndex(['assignment_id'], ['unique' => false])
            ->addIndex(['moodle_id','assignment_id'], ['unique' => true])
            ->create();
    }
}
