<?php

/**
 * Sentry, a Matomo plugin by Digitalist Open Tech
 *
 * @link https://github.com/digitalist-se/MatomoPlugin-Sentry
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\Sentry\tests\Unit;

use Piwik\Plugins\Sentry\SystemSettings;
use Piwik\Plugins\Sentry\Sentry;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * @group Sentry
 * @group Plugins
 */
class SentryTest extends IntegrationTestCase
{
    private $idSite = 1;

    /**
     * @var SystemSettings
     */
    private $settings;

    /**
     * @var Sentry
     */
    private $sentry;


    public function setUp(): void
    {
        if (!Fixture::siteCreated($this->idSite)) {
            Fixture::createWebsite('2024-03-01 00:00:00');
        }

        $this->settings = new SystemSettings();
        $this->sentry = new Sentry();
    }

    public function tearDown(): void
    {
        // Just for documentation.
    }

    /**
     * Test if response is array.
     */
    public function testRegisterEvents()
    {
        $this->assertIsArray($this->sentry->registerEvents());
    }

    /**
     * Test if array contains expected keys
     */
    public function testRegisterEventsContainsKeys()
    {
        $this->assertArrayHasKey('AssetManager.getJavaScriptFiles', $this->sentry->registerEvents());
        $this->assertArrayHasKey('Template.jsGlobalVariables', $this->sentry->registerEvents());
    }

    /**
     * Test if array contains expected values
     */
    public function testRegisterEventsContainsValues()
    {
        $this->assertContains('getJSFiles', $this->sentry->registerEvents());
        $this->assertContains('addJsVariables', $this->sentry->registerEvents());
    }
}
