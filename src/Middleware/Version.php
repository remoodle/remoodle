<?php 

namespace App\Middleware;

use Core\Config;
use Slim\Psr7\Factory\ResponseFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

class Version implements MiddlewareInterface
{
    public function __construct(
        private ResponseFactory $responseFactory
    ){}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return $handler->handle($request)
            ->withHeader('Version', Config::get("app.version"))
            ->withHeader('Access-Control-Expose-Headers', 'Version');
    }
}