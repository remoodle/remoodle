<?php

namespace Queue\Actions;

// use App\Modules\Moodle\Entities\Event;
use Illuminate\Database\Connection;
use Queue\Actions\Batch\GetEventsBatch;
use Queue\Actions\Batch\Events\EventsBatchDto;

final class ParseUserEventsBatch
{
    /**
     * @param EventsBatchDto[] $DTOs
     * @param \Illuminate\Database\Connection $connection
     * @param string $moodleWebservicesUrl
     */
    public function __construct(
        private readonly array $DTOs,
        private readonly Connection $connection,
        private string $moodleWebservicesUrl
    ) {
    }

    public function __invoke()
    {
        $events = (new GetEventsBatch())->__invoke($this->moodleWebservicesUrl, ...$this->DTOs);
        $this->connection->beginTransaction();

        try {
            $this->connection->table("events")->upsert($events, ["instance"]);
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }
    }
}
