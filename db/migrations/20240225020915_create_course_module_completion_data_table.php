<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCourseModuleCompletionDataTable extends AbstractMigration
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
        $table = $this->table('course_module_completion_data', ["id" => false, "primary_key" => "cmid"]);
        $table
            ->addColumn("cmid", "integer", ["null" => false, "signed" => false])
            ->addColumn("overrideby", "string", ["null" => true])
            ->addColumn("state", "integer", ["null" => false, "signed" => false])
            ->addColumn("timecompleted", "integer", ["null" => false, "signed" => false])
            ->addColumn("valueused", "boolean", ["null" => false])
            ->addColumn("hascompletion", "boolean", ["null" => false])
            ->addColumn("isautomatic", "boolean", ["null" => false])
            ->addColumn("istrackeduser", "boolean", ["null" => false])
            ->addColumn("uservisible", "boolean", ["null" => false])

            ->addForeignKey('cmid', 'course_modules', 'cmid', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->create();
    }
}
