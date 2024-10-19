<?php

declare(strict_types=1);

namespace Core\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateMigration extends Command
{
    public const MIGRATIONS_DIR =  BASE_DIR . "/db/migrations";

    protected function configure()
    {
        $this
            ->setName("make:migration")
            ->setDescription('Creates a new migration.')
            ->addArgument('name', InputArgument::REQUIRED, 'The name of the migration.');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {

        $migrationName = $input->getArgument("name");

        $command = escapeshellcmd(BASE_DIR . "/vendor/bin/phinx create $migrationName");

        $output = [];
        $returnVar = null;
        if(exec($command, $output, $returnVar)) {
            return Command::SUCCESS;
        }

        return Command::FAILURE;
    }
}
