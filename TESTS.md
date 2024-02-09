# Running tests

## PHPStan

Go to Sentry plugin dir:

```bash
composer install
```

Go to Matomo root (/var/www/html usually) and run:

```bash
/var/www/html/plugins/Sentry/vendor/bin/phpstan analyze -c /var/www/html/plugins/Sentry/tests/phpstan.neon --level=5 /var/www/html/plugins/Sentry
```

## PHP CodeSniffer

Go to Sentry plugin dir:

```bash
composer install
```

Run PHP CodeSniffer

```bash
vendor/bin/phpcs --ignore=*/vendor/*,*/node_modules/*,*.js  --standard=PSR2 .
vendor/bin/phpcs --ignore=*/vendor/*,*/node_modules/*,*.js  --standard=PSR12 .
```
