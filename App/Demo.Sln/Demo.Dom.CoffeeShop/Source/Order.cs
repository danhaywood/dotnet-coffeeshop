using System.ComponentModel.DataAnnotations;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{

    [MetadataType(typeof(Order_Metadata))]
    [IconName("icons/Order.gif")]
    public partial class Order
    {

        public string Title()
        {
            var t = new TitleBuilder();
            t.Append(CustomerName);
            return t.ToString();
        }

        
        #region Injected services
        [NakedObjectsIgnore]
        public IDomainObjectContainer Container { set; protected get; }
        #endregion
    }

    public partial class Order_Metadata
    {
        #region CustomerState
        [EnumDataType(typeof(OrderCustomerStates))]
        public byte CustomerState { get; set; }
        #endregion

        #region BaristaState
        [EnumDataType(typeof(OrderBaristaStates))]
        public byte BaristaState { get; set; }
        #endregion
    }
}
