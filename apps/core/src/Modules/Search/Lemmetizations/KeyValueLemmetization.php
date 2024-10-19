<?php

declare(strict_types=1);

namespace App\Modules\Search\Lemmetizations;

use App\Modules\Search\LemmetizationInterface;

class KeyValueLemmetization implements LemmetizationInterface
{
    protected static array $lemmetizationMap;

    public static function bootstrap(array $lemmetizationMap)
    {
        static::$lemmetizationMap = $lemmetizationMap;
    }

    /**
     * @param string $word
     * @throws \Exception
     * @return string
     */
    public function get(string $word): string
    {
        $word = preg_replace("/(?![.=$'€%-])\p{P}/u", "", $word);

        if($word === "") {
            return "";
        }

        $word = mb_strtolower($word);

        // $result = $this->kvStorage->get($word, $word);
        $result = isset(static::$lemmetizationMap[$word]) ? static::$lemmetizationMap[$word] : $word;

        if(!is_string($result)) {
            throw new \Exception("lemmetization expexts string type, " . gettype($result) . " received.");
        }

        return $result;
    }

    /**
     * @param string[] $words
     * @throws \Exception
     * @return string[]
     */
    public function getKeywords(array $words): array
    {
        $result = [];
        foreach($words as $word) {
            if($word === "") {
                continue;
            }

            $word = mb_strtolower($word);

            $lem = $this->get($word);
            $result[] = $lem;
        }

        return $result;
    }
}
