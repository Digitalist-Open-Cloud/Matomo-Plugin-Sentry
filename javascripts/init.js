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
            autoSessionTracking: piwik.autoSessionTracking,
            enableTracing: true,
            integrations: [
                Sentry.browserTracingIntegration()
            ],
            tracesSampleRate: 1.0,

            //tracesSampleRate: piwik.tracesSampleRate
        });
    }
})(jQuery, require);
