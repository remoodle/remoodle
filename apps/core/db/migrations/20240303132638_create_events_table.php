<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateEventsTable extends AbstractMigration
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
        $table = $this->table('events', ["id" => false, "primary_key" => "event_id"]);

        $table
            ->addColumn('event_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('timestart', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('instance', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('visible', 'boolean', ['null' => false])
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('course_name', 'string', ['signed' => false, 'null' => false])

            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])

            ->addIndex(['course_id'], ['unique' => false])
            ->addIndex(['instance'], ['unique' => true])
            ->create();
    }
}
