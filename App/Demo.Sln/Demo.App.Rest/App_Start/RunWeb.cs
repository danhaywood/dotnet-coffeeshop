using Demo.Dom.CoffeeShop;
using NakedObjects.Boot;
using NakedObjects.Core.Context;
using NakedObjects.Core.NakedObjectsSystem;
using NakedObjects.EntityObjectStore;
using RestfulObjects.Bootstrap;

namespace Demo.App.Rest.App_Start
{
	public class RunWeb : RunRest {
		protected override NakedObjectsContext Context {
			get { return HttpContextContext.CreateInstance(); }
		}

		protected override IServicesInstaller MenuServices {
            get { return new ServicesInstaller(new object[]
                                                   {
                                                       new ProductCatalog(),
                                                       new CustomerServices()
                                                   }); }
		}

		protected override IServicesInstaller ContributedActions {
			get { return new ServicesInstaller(new object[] {}); }
		}

		protected override IServicesInstaller SystemServices {
			get { return new ServicesInstaller(new object[] {}); }
		}

		protected override IObjectPersistorInstaller Persistor {
			get { return new EntityPersistorInstaller(); }
		}

		//For 'Code First' development replace Persistor property with:
		//protected override IObjectPersistorInstaller Persistor {
		//    get {
		//        return new EntityPersistorInstaller {
		//            CodeFirst = true,
		//            CodeFirstConfig = new[] {
		//            new EntityPersistorInstaller.EntityCodeFirstConfig {AssemblyName = "MyModelAssemblyName", DataSource = @".\SqlExpress", DatabaseName = "database1"}}
		//        };
		//    }
		//}

		public static void Run() {
			new RunWeb().Start();
		}
	}
}