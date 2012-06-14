using System.ComponentModel;
using System.Linq;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{
    /// <summary>
    /// Customer repo.
    /// </summary>
    [DisplayName("Products")]
    [IconName("icons/Product.png")]
    public class ProductCatalog
    {
        [MemberOrder(10)]
        [PageSize(25)]
        public IQueryable<Product> AllDrinks()
        {
            return from p in Container.Instances<Product>()
                   where !p.Addition
                   select p;
        }

        [MemberOrder(20)]
        [PageSize(25)]
        public IQueryable<Product> AllAdditions()
        {
            return from p in Container.Instances<Product>()
                   where p.Addition
                   select p;
        }

        [Hidden]
        public Product LookupByName(string name)
        {
            return (from p in Container.Instances<Product>()
                   where p.Name == name
                   select p).FirstOrDefault();
        }

        #region Injected Services
        public IDomainObjectContainer Container { set; protected get; }
        #endregion

    }
}
