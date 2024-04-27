<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateNotificationTable extends AbstractMigration
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
        $table = $this->table('notifications', ["id" => false, "primary_key" => "uuid"]);

        $table
            ->addColumn('uuid', 'uuid', ['null' => false])
            ->addColumn('moodle_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('title', 'string', ['null' => false])
            ->addColumn('message', 'string', ['null' => false])
            ->addColumn('attachments', 'string', ['null' => true])

            ->addForeignKey('moodle_id', 'moodle_users', 'moodle_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])

            ->addIndex(['moodle_id'], ['unique' => false])
            ->create();
    }
}
