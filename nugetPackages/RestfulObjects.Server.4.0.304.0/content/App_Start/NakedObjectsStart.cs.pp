using System.Web.Routing;
using NakedObjects.Rest.API;
using $rootnamespace$.App_Start;
using NakedObjects.Snapshot.Rest.Utility;
using WebActivator;

[assembly: PreApplicationStartMethod(typeof (NakedObjectsStart), "PreStart")]
[assembly: PostApplicationStartMethod(typeof (NakedObjectsStart), "PostStart")]

namespace $rootnamespace$.App_Start {
    public static class NakedObjectsStart {
        public static void PreStart() {
            RegisterRoutes(RouteTable.Routes);
        }

        public static void PostStart() {
            RunWeb.Run();
        }

        public static void RegisterRoutes(RouteCollection routes) {
            NakedObjectsRestfulApi.AddRestRoutes(routes);

            // to make readonly 
            //NakedObjectsRestfulApi.IsReadOnly = true;

            // to configure domain model options 
            //NakedObjectsRestfulApi.DomainModel = RestControlFlags.DomainModelType.Selectable;

            // to set authority explicitly 
            //UriMtHelper.GetAuthority = req => "myURL";
        }
    }
}