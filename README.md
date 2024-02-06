# Matomo Sentry Plugin

## Description

Log errors from Matomo to a [Sentry](https://sentry.io/) instance, or Sentry compatible setup like [GlitchTip](https://glitchtip.com/). [Here is a guide](https://guides.lw1.at/how-to-install-glitchtip-without-docker/) by [@Findus23](https://github.com/Findus23) how to setup GlitchTip if you are not using Docker.

## Installation

* Clone github repo into plugins/Sentry.
* Go into plugins/Sentry.
* Run composer install --no-dev for productions use.
* Install Sentry plugin in Matomo.
* Go to settings page for adding the adding the Sentry Data Source Name (DSN).
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
