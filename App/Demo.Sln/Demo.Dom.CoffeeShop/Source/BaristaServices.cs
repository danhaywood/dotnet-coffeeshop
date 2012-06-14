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
    [IconName("icons/Barista.png")]
    public class BaristaServices
    {

        #region PlacedOrders
        [MemberOrder(10)]
        public IQueryable<Order> PlacedOrders()
        {
            return from o in Container.Instances<Order>()
                    where o.BaristaState == (byte) OrderBaristaStateEnum.InQueue
                    orderby o.PlacedOn ascending
                    select o;
        }
        #endregion

        #region NextOrder
        [MemberOrder(20)]
        public Order NextOrder()
        {
            var order = PlacedOrders().FirstOrDefault();
            if (order == null)
            {
                return null;
            }
            order.CustomerState = (byte) OrderCustomerStateEnum.BaristaPreparingDrink;
            order.BaristaState = (byte)OrderBaristaStateEnum.ChosenAndBeingPrepared;
            return order;
        }
        #endregion

        #region ChooseOrder (if order placed)
        [MemberOrder(25)]
        public void ChooseOrder(Order order)
        {
            order.BaristaStateEnum = OrderBaristaStateEnum.ChosenAndBeingPrepared;
            if (order.CustomerStateEnum == OrderCustomerStateEnum.Placed)
            {
                order.CustomerStateEnum = OrderCustomerStateEnum.BaristaPreparingDrink;
            }
        }
        public string ValidateChooseOrder(Order order)
        {
            if (order.IsBaristaState(OrderBaristaStateEnum.OrderCancelled))
            {
                return "Order has been cancelled";
            }
            if (!order.IsBaristaState(OrderBaristaStateEnum.InQueue))
            {
                return "Order has already been chosen";
            }
            return null;
        }
        #endregion

        #region DrinkMade (if order chosen)
        [MemberOrder(30)]
        public void DrinkMade(Order order)
        {
            order.BaristaStateEnum = 
                order.CustomerStateEnum == OrderCustomerStateEnum.Paid ? 
                OrderBaristaStateEnum.DrinkReleased : 
                OrderBaristaStateEnum.DrinkMade;
            if (order.CustomerStateEnum == OrderCustomerStateEnum.Paid)
            {
                order.CustomerStateEnum = OrderCustomerStateEnum.BaristaReleasedDrink;
            }
        }

        public string ValidateDrinkMade(Order order)
        {
            if (!order.IsBaristaState(OrderBaristaStateEnum.ChosenAndBeingPrepared))
            {
                return "Barista has not yet chosen this order";
            }
            return null;
        }
        #endregion

        #region Injected Services
        public IDomainObjectContainer Container { set; protected get; }
        public ProductCatalog Products { set; protected get; }
        #endregion
    }
}
