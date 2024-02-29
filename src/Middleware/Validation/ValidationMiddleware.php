<?php 

namespace App\Middleware\Validation;

use MadeSimple\Validator\Validator;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

abstract class ValidationMiddleware implements MiddlewareInterface
{
    protected array $bodyRules = [];
    protected array $queryRules = [];

    protected bool $validateBody;
    protected bool $validateQuery;

    protected string $look = "";

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {   
        [$validationStatus, $validationMessage] = $this->validate($request);
        
        if($validationStatus){
            return $handler->handle($request);
        }

        throw new \Exception($validationMessage, 422);
    }

    protected function validate(ServerRequestInterface $request): array
    {
        [$bodyValidationStatus, $bodyValidationError] = $this->validateBody ? $this->validateRequestBody($request) : [true, null];
        [$queryValidationStatus, $queryValidationError] = $this->validateQuery ? $this->validateRequestQuery($request) : [true, null];

        if($bodyValidationStatus && $queryValidationStatus){
            return [true, null];
        }

        return [false,  ($bodyValidationError ?? "")  . ($queryValidationError ?? "")];
    }

    protected function validateRequestBody(ServerRequestInterface $request): array
    {
        $body = $request->getParsedBody();
        $validator = new Validator();
        $validator->validate($body, $this->bodyRules);

        return [!$validator->hasErrors(), $this->concateErrors($validator->getProcessedErrors())];
    }


    protected function validateRequestQuery(ServerRequestInterface $request): array
    {
        $requestParamsArray = $request->getQueryParams();
        $validator = new Validator();
        $validator->validate($requestParamsArray, $this->queryRules);
        
        return [!$validator->hasErrors(), $this->concateErrors($validator->getProcessedErrors())];
    }

    protected function concateErrors(array $validationErrors): ?string
    {
        if($validationErrors === []){
            return null;
        }

        $errorString = "";

        foreach($validationErrors["errors"] as $field=>$validationError){
            $errorString .= "$field:";
            foreach($validationError as $error){
                $errorString .= " $error. ";
            }
        }

        return $errorString;
    }
}