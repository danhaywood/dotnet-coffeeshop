using System;
using System.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NakedObjects.Boot;
using NakedObjects.Core.NakedObjectsSystem;
using NakedObjects.EntityObjectStore;
using NakedObjects.Xat;

namespace Demo.TestSupport
{
    public abstract class AbstractIntegTest : AcceptanceTestCase
    {
        private readonly ResetDatabase _resetDatabase;
        private readonly object[] _services;

        protected AbstractIntegTest(String efConnStrKey, params Object[] services)
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

            _services = services;
        }

        public TestContext TestContext { get; set; }

        public ResetDatabase ResetDatabase { get { return _resetDatabase;  } }

        protected override IServicesInstaller MenuServices
        {
            get
            {
                return new ServicesInstaller(_services);
            }
        }

        protected override IObjectPersistorInstaller Persistor
        {
            get { return new EntityPersistorInstaller(); }
        }

    }
}
