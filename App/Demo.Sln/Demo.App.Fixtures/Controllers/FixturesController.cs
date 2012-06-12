using System.Configuration;
using System.IO;
using System.Web.Hosting;
using System.Web.Mvc;
using Demo.TestSupport;
using Demo.Util;

namespace Demo.App.Fixtures.Controllers
{
    public class FixturesController : Controller
    {
        private readonly ResetDatabase _resetDatabase;

        public FixturesController()
        {
            var efConnStr = ConfigurationManager.ConnectionStrings["CoffeeShopContainer"].ConnectionString;
            _resetDatabase = ResetDatabase.CreateFromEFConnectionString(efConnStr);
        }

        public ActionResult ResetCoffeeShop()
        {
            ResetFixtureSheet(Demo.Dom.CoffeeShop.Fixtures.Properties.Resources.CoffeeShop);
            return View("Ok", model:"Coffeeshop reset");
        }

        private void ResetFixtureSheet(byte[] fixtureSheetBytes)
        {
            _resetDatabase.ResetFromFixtureSheet(fixtureSheetBytes);
        }
    }
}