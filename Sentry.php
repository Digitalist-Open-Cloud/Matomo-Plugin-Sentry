<?php

namespace Piwik\Plugins\Sentry;

use Piwik\Config;
use Piwik\Piwik;
use Piwik\Plugins\LanguagesManager\LanguagesManager;
use Piwik\Version;
use Sentry\Severity;
use Piwik\Url;
use Piwik\Common;

class Sentry extends \Piwik\Plugin
{
    /**
     * @var string Config
     */
    private $hostname;

    /**
     * @param bool|string $pluginName
     */
    public function __construct($pluginName = false)
    {
        $matomoHost = Config::getHostname();
        if (strlen($matomoHost) == 0) {
            $host = Url::getHost($checkIfTrusted = false);
            $host = Url::getHostSanitized($host);
            $host = Common::sanitizeInputValue($host);
            if (strlen($host) == 0) {
              $host = 'localhost';
            }
            $matomoHost = Url::getHostSanitized($host);
        }
        $this->hostname = $matomoHost;

        parent::__construct($pluginName);
        $settings = new SystemSettings();

        $dsn = $settings->DSN->getValue();
        $dsnSamplerate = $settings->DSNSampleRateSetting->getValue();
        $dsnEnvironment = $settings->DSNEnvironment->getValue();
        if ($dsn) {
            require_once PIWIK_INCLUDE_PATH . '/plugins/Sentry/vendor/autoload.php';
            \Sentry\init([
                'dsn' => $dsn,
                'release' => Version::VERSION,
                'sample_rate' => floatval($dsnSamplerate),
                'environment' => $dsnEnvironment,
            ]);
            $user = Piwik::getCurrentUserLogin();

            $metadata = [
                "module" => Piwik::getModule(),
                "action" => Piwik::getAction(),
                "language" => LanguagesManager::getLanguageCodeForCurrentUser(),
                "hostname" => $this->hostname
            ];

            \Sentry\configureScope(function (\Sentry\State\Scope $scope) use ($metadata, $user): void {
                $scope->setLevel(Severity::error());
                $scope->setUser([
                  'username' => $user
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
    public function registerEvents()
    {
        return array(
            'AssetManager.getJavaScriptFiles' => 'getJSFiles',
            'Template.jsGlobalVariables' => 'addJsVariables',
        );
    }

    /**
     * @return Array
     */
    public function getJSFiles(&$file)
    {
        $file[] = 'plugins/Sentry/libs/bundle.min.js';
        $file[] = 'plugins/Sentry/javascripts/init.js';
    }

    public function addJsVariables(&$out)
    {
        $settings = new SystemSettings();
        $dsnEnvironment = $settings->DSNEnvironment->getValue();
        $autoSessionTracking = boolval($settings->autoSessionTracking->getValue());
        if ($autoSessionTracking == 1) {
            $autoSessionTracking = true;
        } else {
            $autoSessionTracking = false;
        }
        $autoSessionTracking = boolval($settings->autoSessionTracking->getValue());
        $version = Version::VERSION;
        $dsn = $settings->browserDSN->getValue();
        $hostname = $this->hostname;
        $out .= "piwik.sentryDSN = '$dsn';\n";
        $out .= "piwik.matomoRelease = '$version';\n";
        $out .= "piwik.sentryEnv = '$dsnEnvironment';\n";
        $out .= "piwik.autoSessionTracking = '$autoSessionTracking';\n";
        $out .= "piwik.hostname = '$hostname';\n";
    }
}
