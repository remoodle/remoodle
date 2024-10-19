<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateSearchItemKeywordTable extends AbstractMigration
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
        $table = $this->table('search_item_keywords', ['id' => true]);

        $table
            ->addColumn('keyword', 'string', ['null' => false])
            ->addColumn('search_item_id', 'string', ['null' => false])
            ->addColumn('occurences', 'integer', ['null' => false])

            ->addForeignKey('keyword', 'keywords', 'word', ['delete' => 'CASCADE'])
            ->addForeignKey('search_item_id', 'search_items', 'item_id', ['delete' => 'CASCADE'])
            ->addIndex(['keyword', 'search_item_id'], [
                'unique' => true
            ])
            ->create();
    }
}
