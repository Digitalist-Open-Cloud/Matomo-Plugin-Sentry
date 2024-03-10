<?php

/**
 * Sentry, a Matomo plugin by Digitalist Open Tech
 *
 * @link https://github.com/digitalist-se/MatomoPlugin-Sentry
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\Sentry\tests\Unit;

use Piwik\Plugins\Sentry\SystemSettings;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * @group Sentry
 * @group SystemSettingsTest
 * @group Plugins
 */
class SystemSettingsTest extends IntegrationTestCase
{
    private $idSite = 1;

    /**
     * @var SystemSettings
     */
    private $settings;

    public function setUp(): void
    {
        if (!Fixture::siteCreated($this->idSite)) {
            Fixture::createWebsite('2024-03-01 00:00:00');
        }

        $this->settings = new SystemSettings();
    }

    public function tearDown(): void
    {
        // Just for documentation.
    }

    public function testSetDSN()
    {
        $this->settings->DSN->setValue('https://foo.bar');
        $this->assertSame('https://foo.bar', $this->settings->DSN->getValue());
    }

    public function testSetDSNSampleRateSetting()
    {
        $this->settings->DSNSampleRateSetting->setValue('0.8');
        $this->assertSame(0.8, $this->settings->DSNSampleRateSetting->getValue());
    }

    /**
     *  Check so we can set tracesSampleRateSetting
     */
    public function testSetTracesSampleRateSetting()
    {
        $this->settings->tracesSampleRateSetting->setValue('0.7');
        $this->assertSame(0.7, $this->settings->tracesSampleRateSetting->getValue());
    }

    /**
     *  Check so we can set BrowserDSN
     */
    public function testSetBrowserDSN()
    {
        $this->settings->browserDSN->setValue('https://bar.foo');
        $this->assertSame('https://bar.foo', $this->settings->browserDSN->getValue());
    }

    /**
     * Check so we get default correct, which is 'production'.
     */
    public function testGetDSNEnvironment()
    {
        $this->assertSame('production', $this->settings->DSNEnvironment->getValue());
    }

    public function testSetDSNEnvironment()
    {
        $this->settings->DSNEnvironment->setValue('develop');
        $this->assertSame('develop', $this->settings->DSNEnvironment->getValue());
    }

    public function testSetCreateDSNDomain()
    {
        $this->settings->createDSNDomain->setValue('foobar.foo');
        $this->assertSame('foobar.foo', $this->settings->createDSNDomain->getValue());
    }

    public function testSetAutoSessionTracking()
    {
        $this->settings->autoSessionTracking->setValue(1);
        $this->assertSame(true, $this->settings->autoSessionTracking->getValue());
    }


    /**
     * Check so we get default correct, which is false.
     */
    public function testGetBrowserTracing()
    {
        $this->assertSame(false, $this->settings->browserTracing->getValue());
    }

    /**
     * Check so we get can activate.
     */
    public function testSetBrowserTracing()
    {
        $this->settings->browserTracing->setValue(1);
        $this->assertSame(true, $this->settings->browserTracing->getValue());
    }

    /**
     * Check so we get default correct, which is 0.0.
     */
    public function testGetBrowserTracingRate()
    {
        $this->assertSame(0.0, $this->settings->browserTracingRate->getValue());
    }

    /**
     * Check so we could set rate to 0.2.
     */
    public function testSetBrowserTracingRate()
    {
        $this->settings->browserTracingRate->setValue('0.2');
        $this->assertSame(0.2, $this->settings->browserTracingRate->getValue());
    }
}
