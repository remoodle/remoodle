<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCourseTable extends AbstractMigration
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
        $table = $this->table('courses', ["id" => false, 'primary_key' => 'course_id']);
        $table
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])

            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('coursecategory', 'string', ['null' => false])
            ->addColumn('url', 'string', ['null' => false])
            ->addColumn('start_date', 'integer', ['null' => true])
            ->addColumn('end_date', 'integer', ['null' => true])
            ->addColumn('status', 'enum', ['values' => ['past', 'inprogress', 'future'], 'default' => 'inprogress'])
            ->addIndex(['coursecategory'], ['unique' => false])
            ->addIndex(['name'], ['unique' => false])
            ->create();
    }
}
