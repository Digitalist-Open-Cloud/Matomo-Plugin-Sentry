(function ($, require) {
    if (piwik.sentryDSN) {
        Sentry.configureScope(function (scope) {
            scope.setLevel("warning");
          });
        Sentry.setTag("hostname", piwik.hostname);
        Sentry.init({
            dsn: piwik.sentryDSN,
            release: piwik.matomoRelease,
            environment: piwik.sentryEnv,
            autoSessionTracking: Boolean(piwik.autoSessionTracking),
            integrations: [new Sentry.BrowserTracing()],
            tracesSampleRate: parseFloat(piwik.tracesSampleRate),
            browserTracing: Boolean(piwik.browserTracing),
        });
    }
})(jQuery, require);
