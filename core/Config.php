<?php

namespace Core;

class Config
{
    private static array $configs = [];
    private static bool $isLoaded = false;

    private function __construct(){}

    public static function loadConfigs(): void
    {
        if (self::$isLoaded) {
            return;
        }

        $configPath = $_ENV["CONFIG_PATH"] ?? __DIR__ . "/../config";
        foreach (scandir($configPath) as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) == 'php') {
                $configKey = basename($file, '.php');
                self::$configs[$configKey] = require $configPath . "/" . $file;
            }
        }

        self::$isLoaded = true;
    }

    public static function get(string $key, mixed $default = null) : mixed
    {
        $keyParts = explode(".", $key);
        $file = array_shift($keyParts);

        if (!isset(self::$configs[$file])) {
            return $default;
        }

        $config = self::$configs[$file];
        foreach ($keyParts as $subKey) {
            if (is_array($config) && array_key_exists($subKey, $config)) {
                $config = $config[$subKey];
            } else {
                return $default;
            }
        }

        return $config;
    }
}
