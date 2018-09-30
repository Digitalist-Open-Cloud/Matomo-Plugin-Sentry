(function ($, require) {
    if (piwik.sentryDSN) {
        Sentry.init({
            dsn: piwik.sentryDSN
        });
    }
})(jQuery, require);
