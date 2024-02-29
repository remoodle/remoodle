<?php 

namespace App\Middleware;

use App\Models\MoodleUser as User;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class Auth implements MiddlewareInterface
{
    const TOKEN_HEADER = "Auth-Token";
 
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
        return $request->hasHeader(static::TOKEN_HEADER);
    }

    private function headerTokenIsValid(ServerRequestInterface $request): array
    {   
        $token = $request->getHeader(static::TOKEN_HEADER);
        $user = User::where("moodle_token", $token)->first();
        if(!$user){
            return [false, $request];
        }

        return [true, $request->withAttribute("user", $user)];
    }
}

