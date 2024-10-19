<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCourseGroupsTable extends AbstractMigration
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
        $table = $this->table('course_groups', ['id' => false, 'primary_key' => 'id']);
        $table
            ->addColumn('id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('idnumber', 'string', ['null' => false])
            ->addColumn('description', 'string', ['null' => false])
            ->addColumn('descriptionformat', 'integer', ['null' => false])

            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])

            ->addIndex(['course_id'], ['unique' => false])
            ->addIndex(['name'], ['unique' => false])
            ->create()
        ;
    }
}
