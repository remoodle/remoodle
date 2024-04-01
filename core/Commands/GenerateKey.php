<?php

declare(strict_types=1);

namespace Core\Commands;

use Core\Config;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateKey extends Command
{
    public const ENV_PATH = BASE_DIR . "/.env";

    protected function configure(): void
    {
        $this
            ->setName("key:generate")
            ->setDescription('Generates a key.');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $key = $this->generateRandomKey();

        $replaced = preg_replace(
            $this->keyReplacementPattern(),
            'CRYPT_KEY='.$key,
            $input = file_get_contents(static::ENV_PATH)
        );

        if ($replaced === $input || $replaced === null) {
            $output->writeln('Unable to set application key. No CRYPT_KEY variable was found in the .env file.');

            return Command::FAILURE;
        }

        file_put_contents(static::ENV_PATH, $replaced);

        $output->writeln('Application key set successfully.');
        return Command::SUCCESS;
    }

    protected function generateRandomKey(): string
    {
        return 'base64:'.base64_encode(
            \openssl_random_pseudo_bytes(32)
        );
    }

    protected function keyReplacementPattern(): string
    {
        $escaped = preg_quote('='.Config::get("crypt.key"), '/');

        return "/^CRYPT_KEY{$escaped}/m";
    }

}
