# Matomo Sentry Plugin

## Description

Log errors from Matomo to a [Sentry](https://sentry.io/) instance, or Sentry compatible setup like [GlitchTip](https://glitchtip.com/).

> [!WARNING]
> With this plugin activated, the data of the logged in user could be logged in Sentry, handle all user data with care, and make sure you are using settings that anonymize the data.

## Installation

* Clone GitHub repo into plugins/Sentry.
* Go into root for your Matomo project (/var/www/html).
* Run composer install --no-dev for productions use.
* Install Sentry plugin in Matomo.
* Go to settings page for adding the adding the Sentry Data Source Name (DSN).
* Adjust Error tracking sample rate and Tracing sample rate to you preferred values.
* Save settings.

## Settings

System -> General settings -> Sentry

### DSN

The unique DSN for the project. Without, Sentry will not track errors in PHP.

### Sample rate

Default value is 1, that means all PHP errors will be tracked that the Sentry plugin discovers. To have a lower sample rate, use as an example 0.25 to catch 25% of the errors. 0 disables the error tracking.

### DSN (JS)

For Javascript error tracking. Without it, no JavaScript errors will be tracked.

## Local testing

For local testing see [test documentation](TESTS.md).

## Update Sentry PHP SDK

Sentry PHP SDK is added in composer, and should be installed and updated by composer.

## Update Sentry js

Releases are published in [GitHub](https://github.com/getsentry/sentry-javascript/releases).

When a new release is out, get the latest one from <https://browser.sentry-cdn.com/VERSION/bundle.tracing.min.js>, where VERSION is the latest release. Replace libs/bundle.min.js in the repo with that. Tracing is not supported yet in the plugin, but will be.
