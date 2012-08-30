using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RestfulObjects.Mvc.ClientApp.Controllers
{
    public class SpiroController : Controller
    {
        //
        // GET: /ClientApp/

        public ActionResult Index()
        {
            return View("Classic");
        }

    }
}
