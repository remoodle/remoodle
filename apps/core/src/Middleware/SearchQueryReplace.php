<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class SearchQueryReplace implements MiddlewareInterface
{
    public const REPLACEMENTS = [
        'асс' => 'assignment',
        'ass' => 'assignment',
        'assinment' => 'assignment',
        'assingment' => 'assignment',
        'асик' => 'assignment',
        'ассайнмент' => 'assignment',
        'оценка' => 'grade',
        'курс' => 'course',
        'corse' => 'course',
        'deadline' => 'event',
        'дедлайн' => 'event',
        'адвансед' => 'advanced',
        'веб' => 'web',
        'технологии' => 'technologies',
        'оперейтинг' => 'operating',
        'интро' => 'introduction',
        'интродакшн' => 'introduction',
        'программинг' => 'programming',
        'програминг' => 'programming',
        'программирование' => 'programming',
        'культура' => 'culture',
        'история' => 'history',
        'академ' => 'academic',
        'академик' => 'academic',
        'врайтинг' => 'writing',
        'физра' => 'physical education',
        'айти' => 'it',
        'первый' => '1',
        'второй' => '2',
        'третий' => '3',
        'четвертый' => '4',
        'пятый' => '5',
        'четвёртый' => '4',
        'шестой' => '6',
        'седьмой' => '7',
        'восьмой' => '8',
        'девятый' => '9',
        'десятый' => '10',
        'грэйд' => 'grade',
        'вебка' => 'web',
        'бэк' => 'backend',
        'бэкенд' => 'backend',
        'говно' => 'calculus',
    ];

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $queryArr = explode(" ", $request->getParsedBody()['query']);
        $newQuery = "";

        foreach($queryArr as $word) {
            $newQuery = $newQuery." ".(isset(static::REPLACEMENTS[$word])
                ? static::REPLACEMENTS[$word]
                : $word);
        }

        return $handler->handle($request->withParsedBody(['query' => $newQuery]));
    }
}
