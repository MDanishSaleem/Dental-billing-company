<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Minimal router supporting {param} placeholders and controller@method handlers.
 */
final class Router
{
    /** @var array<int,array{method:string,regex:string,params:string[],handler:mixed}> */
    private array $routes = [];

    public function get(string $path, $handler): void    { $this->add('GET', $path, $handler); }
    public function post(string $path, $handler): void   { $this->add('POST', $path, $handler); }

    public function add(string $method, string $path, $handler): void
    {
        $params = [];
        $regex = preg_replace_callback('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', function ($m) use (&$params) {
            $params[] = $m[1];
            return '([^/]+)';
        }, $path);
        $regex = '#^' . rtrim($regex, '/') . '/?$#';
        $this->routes[] = compact('method', 'regex', 'params', 'handler');
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = '/' . trim($uri, '/');
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['regex'], $uri, $matches)) {
                array_shift($matches);
                $args = array_combine($route['params'], $matches) ?: [];
                $this->invoke($route['handler'], $args);
                return;
            }
        }
        http_response_code(404);
        echo View::renderToString('errors/404', [], 'public');
    }

    private function invoke($handler, array $args): void
    {
        if (is_callable($handler)) {
            $handler($args);
            return;
        }
        // "Controller@method" string
        [$class, $action] = explode('@', $handler);
        $fqcn = 'App\\Controllers\\' . $class;
        $controller = new $fqcn();
        $controller->$action($args);
    }
}
