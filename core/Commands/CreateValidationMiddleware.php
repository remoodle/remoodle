<?php 

namespace Core\Commands;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateValidationMiddleware extends Command
{
    const MIDDLEWARE_DIR = BASE_DIR . "/src/Middleware/Validation";

    protected function configure(): void
    {
        $this
            ->setName("make:validation")
            ->addArgument('name', InputArgument::REQUIRED, 'The name of validation middleware.')
            ->setDescription('Creates a new validation middleware.');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $filename = $input->getArgument("name");
        $filePath = static::MIDDLEWARE_DIR . "/$filename.php";
        if(file_exists($filePath)){
            $output->writeln("File $filePath exists.");
            return Command::FAILURE;
        }

        if(file_put_contents($filePath, $this->getPattern($filename))){
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

        namespace App\Middleware\Validation;
        
        class $className extends ValidationMiddleware
        {
            protected bool \$validateBody = false;
            protected bool \$validateQuery = false;
        
            protected array \$queryRules = [];
            protected array \$bodyRules = [];
        }
        PHP;
    }
}