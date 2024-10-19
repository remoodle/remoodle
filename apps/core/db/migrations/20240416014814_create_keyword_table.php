<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateKeywordTable extends AbstractMigration
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
        $table = $this->table('keywords', ['id' => false, 'primary_key' => 'word']);

        $table
            ->addColumn('word', 'string', ['null' => false])

            //TODO: implement in future
            //NOTE: not used due to skill issue
            //how many items(prev table) has this word. I guess it should be increment only
            // ->addColumn('item_count', 'biginteger', ['null' => false, 'default' => 0])

            // ->addIndex(['word'], [
            //     'name' => 'idx_word_keywords',
            //     'unique' => true
            // ])

            ->create();
    }
}
