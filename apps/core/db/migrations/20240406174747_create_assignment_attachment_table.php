<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateAssignmentAttachmentTable extends AbstractMigration
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
        $table = $this->table('assignment_attachments', ['id' => false, 'primary_key' => 'hash']);

        $table
            ->addColumn('hash', 'string', ['null' => false])

            ->addColumn('filename', 'string', ['null' => false])
            ->addColumn('filepath', 'string', ['null' => false])
            ->addColumn('filesize', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('fileurl', 'string', ['null' => true])
            ->addColumn('timemodified', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('mimetype', 'string', ['null' => false])
            ->addColumn('isexternalfile', 'boolean', ['null' => false])

            ->addColumn('assignment_id', 'integer', ['signed' => false, 'null' => false])
            ->addForeignKey('assignment_id', 'assignments', 'assignment_id', ['delete' => 'CASCADE'])
            ->create();
    }
}
