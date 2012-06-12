using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace Demo.Util
{
    public class ConfigurationUtil
    {
        public static string GetVar(string variable, string defaultValue)
        {
            return
                Environment.GetEnvironmentVariable(variable).
                    Else(ConfigurationManager.AppSettings[variable]).
                    Else(defaultValue);
        }
    }
}
