<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCourseModuleTable extends AbstractMigration
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
        $table = $this->table('course_modules', ["id" => false, 'primary_key' => 'cmid']);
        $table
            ->addColumn('cmid', 'integer', ['signed' => false, 'null' => false])            

            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])            

            ->addIndex(['course_id'], ['unique' => false])
            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->create();
    }
    
}
