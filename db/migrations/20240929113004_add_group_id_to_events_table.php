<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddGroupIdToEventsTable extends AbstractMigration
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
    public function up(): void
    {
        $this->execute(<<<SQL
            TRUNCATE table events;
        SQL);
        $table = $this->table('events');

        $table->removeIndex(['instance']);
        $table->addIndex(['instance'], ['unique' => false]);
        $table->addColumn('group_id', 'integer', ['signed' => false, 'null' => false]);
        $table->addIndex(['group_id'], ['unique' => false]);
        $table->addIndex(['group_id', 'course_id', 'instance'], ['unique' => true]);

        $table->update();
    }

    public function down(): void
    {
        $this->execute(<<<SQL
            TRUNCATE table events;
        SQL);
        $table = $this->table('events');

        $table->removeIndex(['instance']);
        $table->addIndex(['instance'], ['unique' => true]);
        $table->removeIndex(['group_id']);
        $table->removeIndex(['group_id', 'course_id', 'instance']);
        $table->removeColumn('group_id');

        $table->update();
    }
}
