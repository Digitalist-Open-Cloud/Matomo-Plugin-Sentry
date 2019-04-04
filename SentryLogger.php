<?php
/**
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\SentryLogger;

use Monolog\Logger;
use Piwik\Config;
use Piwik\Piwik;
use Piwik\Plugins\LanguagesManager\LanguagesManager;
use Piwik\Version;

class SentryLogger extends \Piwik\Plugin
{
    /**
     * @param bool|string $pluginName
     */
    public function __construct($pluginName = false) {
        parent::__construct($pluginName);
        $settings = new SystemSettings();
        $dsn = $settings->DSN->getValue();


        if ($dsn) {
            // Add composer dependencies
            require_once PIWIK_INCLUDE_PATH . '/plugins/SentryLogger/vendor/autoload.php';

            \Sentry\init([
                'dsn' => $dsn,
                'release' => Version::VERSION,
            ]);
            $username = Piwik::getCurrentUserLogin();
            $metadata = [
                "module" => Piwik::getModule(),
                "action" => Piwik::getAction(),
                "currentPlugin" => Piwik::getCurrentPlugin()->pluginName,
                "language" => LanguagesManager::getLanguageCodeForCurrentUser(),
                "hostname" => Config::getHostname()
            ];
            \Sentry\configureScope(function (\Sentry\State\Scope $scope) use ($metadata, $username): void {
                $scope->setUser([
                    'email' => $username
                ]);
                foreach ($metadata as $key => $value) {
                    $scope->setTag($key, $value);
                }
            });
        }
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
