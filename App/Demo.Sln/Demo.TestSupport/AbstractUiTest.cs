using System;
using System.Configuration;
using Demo.Util;

namespace Demo.TestSupport
{
    public abstract class AbstractUiTest : AbstractMsTest
    {
        private readonly ResetDatabase _resetDatabase;
        private readonly string _appServerRootUrl;
        private readonly string _appName;
        private readonly string _appUrl;


        protected AbstractUiTest(String efConnStrKey)
        {
            _appServerRootUrl = "http://" + ConfigurationUtil.GetVar("AppServer", "localhost");
            _appName = ConfigurationUtil.GetVar("AppName", "Demo.App.Mvc");
            _appUrl = _appServerRootUrl.UrlAnd(_appName);

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

        public ResetDatabase ResetDatabase { get { return _resetDatabase;  } }
        public string AppServerRootUrl { get { return _appServerRootUrl; } }
        public string AppName { get { return _appName; } }
        public string AppUrl { get { return _appUrl; } }
    }
}
