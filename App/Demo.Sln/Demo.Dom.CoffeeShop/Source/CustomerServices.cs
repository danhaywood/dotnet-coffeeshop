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
    [DisplayName("Customer Services")]
    [IconName("icons/Customer.png")]
    public class CustomerServices
    {
        #region PlaceOrderByName
        [DisplayName("Place Order")]
        public Order PlaceOrderByName(string drinkName, string customerName)
        {
            var drink = Products.LookupByName(drinkName);
            return PlaceOrder(drink, customerName);
        }

        public string ValidatePlaceOrderByName(string drinkName)
        {
            var drink = Products.LookupByName(drinkName);
            return ValidatePlaceOrder(drink);
        }

        public IList<string> Choices0PlaceOrderByName()
        {
            return Choices0PlaceOrder().Select(p => p.Name).ToList();
        }
        public IList<string> Choices1PlaceOrderByName()
        {
            return Choices1PlaceOrder();
        }
        public string Default1PlaceOrderByName()
        {
            return Default1PlaceOrder();
        }
        #endregion


        #region PlaceOrder
        [Hidden]
        public Order PlaceOrder(Product drink, string customerName)
        {
            var order = Container.NewTransientInstance<Order>();
            order.CustomerName = customerName;
            order.CustomerState = (byte) OrderCustomerStateEnum.Placed;
            order.BaristaState = (byte) OrderBaristaStateEnum.InQueue;
            order.Drink = drink;
            order.Price = drink.Price;
            order.PlacedOn = DateTime.Now;
            Container.Persist(ref order);
            return order;
        }

        public string ValidatePlaceOrder(Product drink)
        {
            return drink != null ? null : "No such drink";
        }

        public IList<Product> Choices0PlaceOrder()
        {
            return (from p in Products.AllDrinks()
                   select p).ToList();
        }
        public IList<string> Choices1PlaceOrder()
        {
            return new List<string>{"John Doe", "Jane Doe"};
        }
        public string Default1PlaceOrder()
        {
            return Choices1PlaceOrder().FirstOrDefault();
        }
        #endregion


        #region Injected Services
        public IDomainObjectContainer Container { set; protected get; }
        public ProductCatalog Products { set; protected get; }
        #endregion

    }
}
