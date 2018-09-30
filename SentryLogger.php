<?php
/**
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\SentryLogger;

use Monolog\Logger;
use Piwik\Version;

class SentryLogger extends \Piwik\Plugin
{
    /**
     * @param bool|string $pluginName
     */
    public function __construct($pluginName = false) {

        $settings = new SystemSettings();
        $dsn = $settings->DSN->getValue();


        if ($dsn) {
            // Add composer dependencies
            require_once PIWIK_INCLUDE_PATH . '/plugins/SentryLogger/vendor/autoload.php';

            $client = new \Raven_Client($dsn);
            $client->setRelease(Version::VERSION);
            $error_handler = new \Raven_ErrorHandler($client);
            $error_handler->registerExceptionHandler();
            $error_handler->registerErrorHandler();
            $error_handler->registerShutdownFunction();
        }
        parent::__construct($pluginName);
    }

    /**
     * @see \Piwik\Plugin::registerEvents
     */
    public function registerEvents() {
        return array(
            'AssetManager.getJavaScriptFiles' => 'getJavaScriptFiles',
            'Template.jsGlobalVariables' => 'addJsGlobalVariables',
        );
    }

    public function getJavaScriptFiles(&$jsFiles) {
        $jsFiles[] = 'plugins/SentryLogger/node_modules/@sentry/browser/build/bundle.min.js';
        $jsFiles[] = 'plugins/SentryLogger/javascripts/init.js';
    }

    public function addJsGlobalVariables(&$out) {

        $settings = new SystemSettings();
        $dsn = $settings->browserDSN->getValue();
        $out .= "piwik.sentryDSN = '$dsn';\n";
    }


}
