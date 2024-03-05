<?php 

namespace App\Middleware;

use App\Models\MoodleUser as User;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\StorageInterface;

final class Auth implements MiddlewareInterface
{
    const TOKEN_HEADER = "Auth-Token";
 
    public function __construct(
        private StorageInterface $storage
    ){}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if(!$this->headerHasToken($request)){
            throw new \Exception(static::TOKEN_HEADER . ' header is required.', StatusCodeInterface::STATUS_UNPROCESSABLE_ENTITY);
        }

        [$headerTokenValidStatus, $validatedRequest] = $this->headerTokenIsValid($request);

        if(!$headerTokenValidStatus){
            throw new \Exception("Request is not authorized.", StatusCodeInterface::STATUS_UNAUTHORIZED);
        }

        return $handler->handle($validatedRequest);
    }

    private function headerHasToken(ServerRequestInterface $request): bool
    {
        return array_key_exists(0, $request->getHeader(static::TOKEN_HEADER));
    }

    private function headerTokenIsValid(ServerRequestInterface $request): array
    {   
        $token = $request->getHeader(static::TOKEN_HEADER)[0];
        $user = $this->storage->get($token); 
        if(!$user){
            return [false, $request];
        }

        return [true, $request->withAttribute("user", $user)];
    }
}

