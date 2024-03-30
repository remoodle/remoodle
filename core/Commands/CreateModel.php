<?php

namespace Core\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateModel extends Command
{
    public const MODELS_DIR =  BASE_DIR . "/src/Models";
    public const CREATE_MIGRATION_COMMAND = "make:migration";

    protected function configure()
    {
        $this
            ->setName("make:model")
            ->setDescription('Creates a new model and optionally a migration.')
            ->addArgument('name', InputArgument::REQUIRED, 'The name of the model.')
            ->addOption('migration', 'm', InputOption::VALUE_NONE, 'Create a migration for the model.');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $modelName = $input->getArgument("name");

        if($input->getOption('migration')) {
            $migrationName = "Create{$modelName}Table";
            $createMigrationCommand = $this->getApplication()->find(static::CREATE_MIGRATION_COMMAND);
            $arguments = [
                'command' => static::CREATE_MIGRATION_COMMAND,
                'name' => $migrationName,
            ];

            $childInput = new ArrayInput($arguments);
            $childInput->setInteractive(false);
            $returnCode = $createMigrationCommand->run($childInput, $output);

            if($returnCode !== Command::SUCCESS) {
                $output->writeln("Error on attemp to create migration.");
                return $returnCode;
            }

            $output->writeln("Migration created.");
        }

        $filePath = static::MODELS_DIR . "/$modelName.php";
        if(file_exists($filePath)) {
            $output->writeln("File $filePath exists.");
            return Command::FAILURE;
        }

        if(file_put_contents($filePath, $this->getPattern($modelName))) {
            $output->writeln("$filePath created.");
            return Command::SUCCESS;
        }

        $output->writeln("Unable to create a new file.");
        return Command::FAILURE;
    }

    protected function getPattern(string $className): string
    {
        return <<<PHP
        <?php

        namespace App\Models;
        
        use Illuminate\Database\Eloquent\Model;
        
        class $className extends Model
        {        
            protected \$fillable = [];  
        }
        PHP;
    }
}
