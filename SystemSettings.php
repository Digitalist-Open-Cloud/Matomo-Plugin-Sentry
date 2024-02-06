<?php

namespace Piwik\Plugins\Sentry;

use Piwik\Settings\Setting;
use Piwik\Settings\FieldConfig;

/**
 * Defines Settings for Sentry.
 *
 * Usage like this:
 * $settings = new SystemSettings();
 * $settings->metric->getValue();
 * $settings->description->getValue();
 */
class SystemSettings extends \Piwik\Settings\Plugin\SystemSettings
{
    /** @var Setting */
    public $DSN;

    /** @var Setting */
    public $DSNSampleRateSetting;

    /** @var Setting */
    public $tracesSampleRateSetting;

    /** @var Setting */
    public $browserDSN;

    /** @var Setting */
    public $autoSessionTracking;

    /** @var Setting */
    public $DSNEnvironment;

    /** @var Setting */
    public $createDSNDomain;

    /**
     * @return void
     */
    protected function init()
    {
        $this->DSN = $this->createDSNSetting();
        $this->DSNSampleRateSetting = $this->createDSNSampleRateSetting();
        $this->tracesSampleRateSetting = $this->createTracesSampleRateSetting();
        $this->browserDSN = $this->createBrowserDSNSetting();
        $this->DSNEnvironment = $this->createEnvironment();
        $this->createDSNDomain = $this->createDSNDomain();
        $this->autoSessionTracking = $this->createBrowserAutoSessionTracking();
    }

    /**
     * @return Setting
     */
    private function createDSNSetting()
    {
        return $this->makeSetting('DSN', "", FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'DSN';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description = 'Add DSN to your Sentry instance, you can use the same for PHP and JS';
        });
    }

    /**
     * @return Setting
     */
    private function createDSNSampleRateSetting()
    {
        return $this->makeSetting('DSNSampleRate', 1.0, FieldConfig::TYPE_FLOAT, function (FieldConfig $field) {
            $field->title = 'Error tracking sample rate (float value)';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description =
              'Add sample rate, 0 for no error tracking, 1.0 for 100% and 0.25 for 25% as an example.';
            $field->validate = function ($value) {
                if (empty($value)) {
                    throw new \Exception('Value is required');
                }
            };
        });
    }

    /**
     * @return Setting
     */
    private function createTracesSampleRateSetting()
    {
        return $this->makeSetting('TracesSampleRate', 0.0, FieldConfig::TYPE_FLOAT, function (FieldConfig $field) {
            $field->title = 'Tracing sample rate (float value)';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description =
              'Default 0 (off). 1.0 for 100% and 0.25 for 25% etc.';
            $field->validate = function ($value) {
                if (empty($value)) {
                    throw new \Exception('Value is required');
                }
            };
        });
    }

    /**
     * @return Setting
     */
    private function createDSNDomain()
    {
        return $this->makeSetting('DSNDomain', "", FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'Domain';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description = 'Domain for your Sentry instance, needed for CSP';
        });
    }

    /**
     * @return Setting
     */
    private function createBrowserDSNSetting()
    {
        return $this->makeSetting('BrowserDSN', "", FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'DSN (JS)';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description = 'If not set, no JavaScript error tracking will be done.';
        });
    }

    /**
     * @return Setting
     */
    private function createBrowserAutoSessionTracking()
    {
        return $this->makeSetting(
            'AutoSessionTracking',
            $default = false,
            FieldConfig::TYPE_BOOL,
            function (FieldConfig $field) {
                $field->title = 'Enable Auto Session Tracking';
                $field->uiControl = FieldConfig::UI_CONTROL_CHECKBOX;
                $field->description = 'If enabled, auto session tracking will be active';
            }
        );
    }

    /**
     * @return Setting
     */
    private function createEnvironment()
    {
        return $this->makeSetting(
            'DSNEnvironment',
            "production",
            FieldConfig::TYPE_STRING,
            function (FieldConfig $field) {
                $field->title = 'Environment';
                $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
                $field->description =
                  'Default=production, you could set this to what your prefer. Environments are case-sensitive.';
            }
        );
    }
}
