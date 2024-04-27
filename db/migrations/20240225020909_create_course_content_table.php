<?php

declare(strict_types=1);

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

final class CreateCourseContentTable extends AbstractMigration
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
        $table = $this->table('course_contents', ["id" => false, 'primary_key' => 'content_id']);
        $table
            ->addColumn('content_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('visible', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('uservisible', 'boolean', ['null' => false])
            ->addColumn('summaryformat', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('hiddenbynumsections', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('summary', 'text', ['null' => true, 'limit' => MysqlAdapter::TEXT_LONG])
            ->addColumn('section', 'integer', ['null' => false, 'signed' => false])
            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->create();
    }
}
