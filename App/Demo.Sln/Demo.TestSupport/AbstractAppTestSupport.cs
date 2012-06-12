using System;
using System.Configuration;
using System.Threading;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Remote;

namespace  Demo.TestSupport
{
    public abstract class AbstractAppTestSupport
    {
        private readonly ResetDatabase _resetDatabase;

        protected AbstractAppTestSupport(String efConnStrKey)
        {
            var connStr = Environment.GetEnvironmentVariable("ConnectionString");
            if (connStr != null)
            {
                _resetDatabase = ResetDatabase.CreateFromConnectionString(connStr);
            }
            else
            {
                var efConnStr = ConfigurationManager.ConnectionStrings[efConnStrKey].ConnectionString;
                _resetDatabase = ResetDatabase.CreateFromEFConnectionString(efConnStr);
            }
        }


        protected string baseURL;
        protected IWebDriver driver;


        /// <summary>
        /// Intended to be called by subclasses in their [TestInitialize] setup method.
        /// Will use environment variable for baseUrl (if specified), otherwise uses the one provided.
        /// Also determines the webdriver to use from environment variable.
        /// </summary>
        /// <param name="fallbackAppServerHostname"></param>
        protected void SetUpWebDriver(string fallbackAppServerHostname)
        {
            this.baseURL = "http://" + (Environment.GetEnvironmentVariable("AppServer")??fallbackAppServerHostname);
            this.driver = CreateWebDriver();
        }

        /// <summary>
        /// Intended to be called by subclasses in their [TestCleanup] setup method.
        /// </summary>
        protected void TearDownWebDriver()
        {
            if (this.driver == null)
            {
                return; 
            }
            driver.Close();
            driver = null;
        }

        private static RemoteWebDriver CreateWebDriver()
        {
            var webDriverName = Environment.GetEnvironmentVariable("WebDriver") ?? "remote-ie";
            var seleniumServer = 
                "http://" + 
                (Environment.GetEnvironmentVariable("SeleniumServer") ?? "localhost") + 
                ":4444/wd/hub";
            var uri = new Uri(seleniumServer);
            
            switch (webDriverName)
            {
                case "firefox":
                    return new FirefoxDriver();
                case "chrome":
                    return new ChromeDriver();
                case "ie":
                    return new InternetExplorerDriver();

                case "remote-firefox":
                    return new RemoteWebDriver(uri, DesiredCapabilities.Firefox());
                case "remote-chrome":
                    return new RemoteWebDriver(uri, DesiredCapabilities.Chrome());
                case "remote-ie":
                    var driver = new CustomRemoteWebDriver(uri, DesiredCapabilities.InternetExplorer());
                    driver.Manage().Timeouts().ImplicitlyWait(new TimeSpan(0, 0, 0, 5, 0));
                    return driver;

                case "htmlunit":
                    return new RemoteWebDriver(DesiredCapabilities.HtmlUnit());
                case "htmlunitwithjs":
                    return new RemoteWebDriver(DesiredCapabilities.HtmlUnitWithJavaScript());

                default:
                    throw new ApplicationException("unknown $env:webDriver");
            }
        }


        public ResetDatabase ResetDatabase { get { return _resetDatabase;  } }

        protected void EnableStylesheet(bool navigateBack = true)
        {
            Execute(Enable, navigateBack);
        }

        private void Enable()
        {
            driver.FindElement(By.LinkText("enable stylesheet")).Click();
            driver.FindElement(By.LinkText("Home")).Click();
        }

        protected void DisableStylesheet(bool navigateBack = true)
        {
            Execute(Disable, navigateBack);
        }

        private void Disable()
        {
            driver.FindElement(By.LinkText("disable stylesheet")).Click();
            driver.FindElement(By.LinkText("Home")).Click();
        }

        protected void ResetCustomerUsingFixturesWebapp(bool navigateBack = true)
        {
            Execute(ResetCustomers, navigateBack);
        }

        private void ResetCustomers()
        {
            driver.FindElement(By.LinkText("reset customers")).Click();
            driver.FindElement(By.LinkText("Home")).Click();
        }

        private void Execute(Action func, bool navigateBack)
        {
            var currentUrl = driver.Url;
            driver.Navigate().GoToUrl(baseURL + "/Demo.App.Fixtures/");
            func();

            if (!navigateBack) return;

            driver.Navigate().GoToUrl(currentUrl);
            driver.Navigate().Refresh();
        }

    }

    public class CustomRemoteWebDriver : RemoteWebDriver
    {
        public CustomRemoteWebDriver(ICapabilities desiredCapabilities) : base(desiredCapabilities)
        {
        }

        public CustomRemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities) : base(remoteAddress, desiredCapabilities)
        {
        }

        public CustomRemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities, TimeSpan commandTimeout) : base(remoteAddress, desiredCapabilities, commandTimeout)
        {
        }

        protected override RemoteWebElement CreateElement(string elementId)
        {
            return new MyWebElement(this, elementId);
        }
    }

    public class MyWebElement : RemoteWebElement, IWebElement
    {
        private readonly RemoteWebDriver _parentDriver;

        public MyWebElement(RemoteWebDriver parentDriver, string id) : base(parentDriver, id)
        {
            _parentDriver = parentDriver;
        }

        void IWebElement.Click()
        {
            if (_parentDriver.Capabilities.BrowserName.StartsWith("HtmlUnit")) {
                Click();
                return;
            }
            
            // ensure focus
            _parentDriver.SwitchTo().Window(_parentDriver.CurrentWindowHandle);

            switch(TagName)
            {
                case "a":
                    SendKeys("\n");
                    Thread.Sleep(100);
                    return;
                case "input":
                    switch (GetAttribute("type"))
                    {
                        case "submit":
                        case "image":
                            Submit();
                            return;
                        case "checkbox":
                        case "radio":
                            //Send the 'spacebar' keystroke
                            SendKeys(" ");
                            return;
                    }
                    break;
                case "button":
                    Submit();
                    return;
            }

            // fallback
            Click();
        }

    }
}
