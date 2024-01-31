<?php

return [
    'Piwik\View\SecurityPolicy' => Piwik\DI::decorate(function ($policy) {
        /** @var \Piwik\View\SecurityPolicy $policy */

        if (!\Piwik\SettingsPiwik::isMatomoInstalled()) {
            return $policy;
        }

        $settings = new Piwik\Plugins\Sentry\SystemSettings();
        $DSNDomain = $settings->getSetting('DSNDomain')->getValue();

        if (isset($DSNDomain)) {
            $policy->addPolicy('default-src', "'self' 'unsafe-eval' $DSNDomain data: https: http:");
        }

        return $policy;
    })
];
