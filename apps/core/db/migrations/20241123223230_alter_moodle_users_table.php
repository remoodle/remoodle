<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AlterMoodleUsersTable extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('moodle_users');
        $table->removeColumn('notify_method');
        $table->removeColumn('webhook');
        $table->removeColumn('webhook_secret');
        $table->removeColumn('grades_notification');
        $table->removeColumn('deadlines_notification');
        $table->update();
    }

    public function down()
    {
        $table = $this->table('moodle_users');
        $table->addColumn('notify_method', 'enum', ['values' => ['get_update', 'webhook'], 'default' => 'get_update']);
        $table->addColumn('webhook', 'string', ['null' => true]);
        $table->addColumn('webhook_secret', 'string', ['null' => true]);
        $table->addColumn('grades_notification', 'boolean', ['default' => false]);
        $table->addColumn('deadlines_notification', 'boolean', ['default' => false]);
        $table->update();
    }
}
