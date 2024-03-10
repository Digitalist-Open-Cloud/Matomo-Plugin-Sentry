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

## PHPUnit

Go to plugins/Sentry

```bash
composer install
````

Got to Matomo web root folder (normally `/var/www/html`).

Set up test environment:

```bash
./console development:enable
./console config:set --section=tests --key=http_host --value=web
./console config:set --section=tests --key=request_uri --value=/
./console config:set --section=database_tests --key=host --value=db
./console config:set --section=database_tests --key=username --value=root
./console config:set --section=database_tests --key=password --value=root
./console config:set --section=database_tests --key=dbname --value=matomo_test
./console config:set --section=database_tests --key=tables_prefix --value=""
```

Run tests:

```bash
/var/www/html/plugins/Sentry/vendor/bin/phpunit -c plugins/Sentry/tests/phpunit.xml
```
