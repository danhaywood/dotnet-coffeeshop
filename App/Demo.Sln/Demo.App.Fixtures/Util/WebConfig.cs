using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Configuration;

namespace Demo.Util
{
    public class WebConfig
    {
        public static string GetSetting(string settingStr)
        {
            return GetSetting(settingStr, null);
        }

        public static string GetSetting(string settingStr, string settingDefault)
        {
            var setting = WebConfigurationManager.AppSettings[settingStr];
            return setting ?? settingDefault;
        }

    }
}
