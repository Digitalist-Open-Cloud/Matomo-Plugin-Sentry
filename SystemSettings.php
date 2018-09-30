<?php
/**
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\SentryLogger;

use Piwik\Settings\Setting;
use Piwik\Settings\FieldConfig;
use Piwik\Validators\NotEmpty;

/**
 * Defines Settings for SentryLogger.
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
    public $browserDSN;
    
    protected function init() {
        $this->DSN = $this->createDSNSetting();
        $this->browserDSN = $this->createBrowserDSNSetting();
    }

    private function createDSNSetting() {
        return $this->makeSetting('DSN', "", FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'Sentry DSN';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description = '';
        });
    }
    private function createBrowserDSNSetting() {
        return $this->makeSetting('BrowserDSN', "", FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'Sentry DSN (JS)';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description = '';
        });
    }
}
