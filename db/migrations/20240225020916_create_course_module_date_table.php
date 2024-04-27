<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCourseModuleDateTable extends AbstractMigration
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
        $table = $this->table('course_module_dates', ["id" => false, 'primary_key' => 'hash']);
        $table
            ->addColumn('hash', 'string', ['null' => false])
            ->addColumn("cmid", "integer", ["null" => false, "signed" => false])
            ->addColumn("label", "string", ["null" => false])
            ->addColumn("timestamp", "integer", ["null" => false, "signed" => false])
            ->addForeignKey('cmid', 'course_modules', 'cmid', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addIndex('cmid')
            ->create();
    }
}
