<?php

declare(strict_types=1);

use Phinx\Db\Table\Column;
use Phinx\Migration\AbstractMigration;

final class AlterDescriptionCourseGroupsTable extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('course_groups');
        $table->changeColumn('description', Column::TEXT);
        $table->update();

    }

    public function down(): void
    {
        $table = $this->table('course_groups');
        $table->changeColumn('description', Column::STRING);
        $table->update();
    }
}
