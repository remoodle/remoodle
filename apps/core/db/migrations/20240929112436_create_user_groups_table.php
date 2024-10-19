<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateUserGroupsTable extends AbstractMigration
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
        $table = $this->table('user_groups', ['id' => true]);
        $table
            ->addColumn('moodle_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('group_id', 'integer', ['signed' => false, 'null' => false])

            ->addForeignKey('group_id', 'course_groups', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('moodle_id', 'moodle_users', 'moodle_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])

            ->addIndex(['group_id'], ['unique' => false])
            ->addIndex(['moodle_id'], ['unique' => false])
            ->addIndex(['group_id', 'moodle_id'], ['unique' => true])

            ->create();
    }
}
