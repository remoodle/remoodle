<?php

declare(strict_types=1);

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

final class CreateCourseModuleTable extends AbstractMigration
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
        $table = $this->table('course_modules', ["id" => false, 'primary_key' => 'cmid']);
        $table
            ->addColumn('cmid', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('course_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('content_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('instance', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('contextid', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('modname', 'string', ['null' => true])
            ->addColumn('modplural', 'string', ['null' => true])
            ->addColumn('noviewlink', 'boolean', ['null' => false])
            ->addColumn('visibleoncoursepage', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('uservisible', 'boolean', ['null' => false])
            ->addColumn('url', 'text', ['null' => true, 'limit' => MysqlAdapter::TEXT_MEDIUM])
            ->addColumn('completion', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('description', 'text', ['null' => false, 'limit' => MysqlAdapter::TEXT_MEDIUM])
            ->addColumn('modicon', 'string', ['null' => false])
            ->addColumn('name', 'string', ['null' => false])
            ->addIndex(['course_id'], ['unique' => false])
            ->addIndex(['content_id'], ['unique' => false])
            ->addForeignKey('course_id', 'courses', 'course_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('content_id', 'course_contents', 'content_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->create();
    }

}
