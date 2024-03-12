<?php 

namespace App\Middleware;

use Core\Config;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class VerifySign implements MiddlewareInterface
{ 
    public function __construct(
        private string $signature = 'signature',
        private array $except = [],
    ){}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $queryParams = $request->getQueryParams();

        if(!array_key_exists($this->signature, $queryParams)){
            throw new \Exception("No signature provided", StatusCodeInterface::STATUS_UNPROCESSABLE_ENTITY);
        }

        $signature = $queryParams[$this->signature];
        unset($queryParams[$this->signature]);
        
        if(hash("sha-256", implode("|", $queryParams) . Config::get("crypt.key")) !== $signature){
            throw new \Exception("Invalid signature", StatusCodeInterface::STATUS_UNPROCESSABLE_ENTITY);
        }

        return $handler->handle($request);
    }
}

