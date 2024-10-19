<?php

declare(strict_types=1);

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

final class CreateAssignmentTable extends AbstractMigration
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
        $table = $this->table('assignments', ['id' => false, 'primary_key' => 'assignment_id']);

        $table
            ->addColumn('assignment_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('cmid', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('nosubmissions', 'boolean', ['null' => false])
            ->addColumn('duedate', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('allowsubmissionsfromdate', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('grade', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('introformat', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('intro', 'text', ['null' => true, 'limit' => MysqlAdapter::TEXT_MEDIUM])

            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addIndex('cmid', [
                'unique' => true
            ])
            ->create();
    }
}
