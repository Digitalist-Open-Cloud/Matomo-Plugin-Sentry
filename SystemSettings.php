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
    public $dsn;
    
    protected function init() {
        $this->dsn = $this->createDSNSetting();
    }
    
    private function createDSNSetting() {
        return $this->makeSetting('dsn', "", FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'Sentry DSN';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->description = '';
        });
    }
}
