(function ($, require) {
    if (piwik.sentryDSN) {
        Sentry.configureScope(function (scope) {
            scope.setLevel("warning");
          });
        Sentry.setTag("hostname", piwik.hostname);
        Sentry.init({
            Vue: Vue,
            dsn: piwik.sentryDSN,
            release: piwik.matomoRelease,
            environment: piwik.sentryEnv,
            autoSessionTracking: piwik.autoSessionTracking,
            integrations: [new Sentry.BrowserTracing()],
            tracesSampleRate: piwik.tracesSampleRate
        });
    }
})(jQuery, require);
