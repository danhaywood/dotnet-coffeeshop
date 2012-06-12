using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{
    /// <summary>
    /// Customer repo.
    /// </summary>
    [DisplayName("Barista Services")]
    public class BaristaServices
    {
        #region Injected Services
        public IDomainObjectContainer Container { set; protected get; }
        public ProductCatalog Products { set; protected get; }
        #endregion


        #region ChooseOrder
        public Order ChooseOrder()
        {
            var order = (from o in Container.Instances<Order>()
                        where o.BaristaState == (byte) OrderBaristaStates.OrderPlaced
                        select o).FirstOrDefault();
            if (order == null)
            {
                return null;
            }
            order.BaristaState = (byte) OrderBaristaStates.OrderChosen;
            return order;
        }
        #endregion
    }
}
