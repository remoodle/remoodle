<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCourseModuleAttachmentTable extends AbstractMigration
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
        $table = $this->table('course_module_attachments', ["id" => false, 'primary_key' => 'hash']);
        $table
            ->addColumn('hash', 'string', ['null' => false])
            ->addColumn("cmid", "integer", ["null" => false, "signed" => false])
            ->addColumn("type", "string", ["null" => false])
            ->addColumn("filename", "string", ["null" => false])
            ->addColumn("filepath", "string", ["null" => true])
            ->addColumn("filesize", "integer", ["null" => false, "signed" => false])
            ->addColumn("fileurl", "text", ["null" => true])
            ->addColumn("timecreated", "integer", ["null" => true, "signed" => false])
            ->addColumn("timemodified", "integer", ["null" => true, "signed" => false])
            ->addColumn("sortorder", "integer", ["null" => true, "signed" => false])
            ->addColumn("mimetype", "string", ["null" => true])
            ->addColumn("isexternalfile", "boolean", ["null" => true])
            ->addColumn("userid", "integer", ["null" => true, "signed" => false])
            ->addColumn("author", "string", ["null" => true])
            ->addColumn("license", "string", ["null" => true])

            ->addForeignKey('cmid', 'course_modules', 'cmid', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addIndex('cmid')
            ->create();
    }
}
