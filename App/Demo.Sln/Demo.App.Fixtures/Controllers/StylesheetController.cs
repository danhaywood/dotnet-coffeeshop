using System;
using System.IO;
using System.Threading;
using System.Web.Mvc;

namespace Demo.App.Fixtures.Controllers
{
    public class StylesheetController : Controller
    {
        private const string _tempDir = "c:\\temp";
        private const string _cssFile = _tempDir + "\\noCss";

        public ActionResult Enable()
        {
            return Execute(DeleteFile) ? 
                View("Ok", model: "stylesheet enabled") : 
                View("Fail", model: "unable to enable stylesheet (could not delete the noCss 'flag' file)");
        }

        public ActionResult Disable()
        {
            return Execute(CreateFile) ?
                View("Ok", model: "stylesheet disabled") :
                View("Fail", model: "unable to disable stylesheet (could not create noCss 'flag' file)");
        }

        private static void DeleteFile()
        {
            System.IO.File.Delete(_cssFile);
        }

        private static void CreateFile()
        {
            if (!Directory.Exists(_tempDir))
            {
                Directory.CreateDirectory(_tempDir);
            }
            var fileStream = System.IO.File.Create(_cssFile);
            fileStream.Close();
        }

        private static bool Execute(Action func)
        {
            for (var i = 0; i < 5; i++)
            {
                try
                {
                    func();
                    return true;
                }
                catch (Exception)
                {
                    Thread.Sleep(500);
                }
            }
            return false;
        }

    }
}