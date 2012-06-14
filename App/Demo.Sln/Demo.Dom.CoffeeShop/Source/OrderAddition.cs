using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{

    [MetadataType(typeof(OrderAddition_Metadata))]
    [IconName("icons/OrderAddition.png")]
    [Immutable]
    public partial class OrderAddition
    {
        #region Title
        public string Title()
        {
            var t = new TitleBuilder();
            t.Append(ProductSku != null ? Product.Title() : "Addition");
            t.Append(" for ").Append(Order != null? Order.CustomerName: "Customer");
            return t.ToString();
        }
        #endregion

        #region Injected services
        [NakedObjectsIgnore]
        public IDomainObjectContainer Container { set; protected get; }
        #endregion
    }

    public partial class OrderAddition_Metadata
    {
        #region OrderNum (hidden)
        [Hidden]
        public string OrderNum { get; set; }
        #endregion

        #region ProductSku (hidden)
        [Hidden]
        public string ProductSku { get; set; }
        #endregion

    }
}
