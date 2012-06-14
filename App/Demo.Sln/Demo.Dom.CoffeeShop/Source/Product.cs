using System.ComponentModel.DataAnnotations;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{

    [MetadataType(typeof(Product_Metadata))]
    [IconName("icons/Product.png")]
    public partial class Product
    {

        public string Title()
        {
            var t = new TitleBuilder();
            t.Append(Name);
            return t.ToString();
        }

        #region Injected services
        [NakedObjectsIgnore]
        public IDomainObjectContainer Container { set; protected get; }
        #endregion
    }

    public partial class Product_Metadata
    {

    }
}
