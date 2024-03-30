<?php

namespace Core\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateController extends Command
{
    public const CONTROLLERS_DIR =  BASE_DIR . "/src/Controllers";

    protected function configure(): void
    {
        $this
            ->setName("make:controller")
            ->addArgument('name', InputArgument::REQUIRED, 'The name of controller.')
            ->setDescription('Creates a new controller.');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $controllerName = $input->getArgument("name");
        $filePath = static::CONTROLLERS_DIR . "/$controllerName.php";
        if(file_exists($filePath)) {
            $output->writeln("File $filePath exists.");

            return Command::FAILURE;
        }

        if(file_put_contents($filePath, $this->getPattern($controllerName))) {
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

        namespace App\Controllers;

        use Psr\Http\Message\ServerRequestInterface as Request;
        use Psr\Http\Message\ResponseInterface as Response;
        
        class $className
        {

        }
        
        PHP;
    }
}
