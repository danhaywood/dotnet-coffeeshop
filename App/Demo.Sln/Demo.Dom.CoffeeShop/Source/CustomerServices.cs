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
    public class CustomerServices
    {
        #region Injected Services
        public IDomainObjectContainer Container { set; protected get; }
        public ProductCatalog Products { set; protected get; }
        #endregion

        #region PlaceOrder
        public Order PlaceOrder(string drinkName, string customerName)
        {
            var order = Container.NewTransientInstance<Order>();
            order.OrderId = Guid.NewGuid();
            order.CustomerName = customerName;
            order.CustomerState = (byte) OrderCustomerStates.OrderPlaced;
            order.BaristaState = (byte) OrderBaristaStates.OrderPlaced;
            var drink = Products.LookupByName(drinkName);
            order.Drink = drink;
            order.Price = drink.Price;
            Container.Persist(ref order);
            return order;
        }

        public string ValidatePlaceOrder(string drinkName)
        {
            var drink = Products.LookupByName(drinkName);
            return drink != null ? null : "No such drink";
        }

        public IList<string> Choices0PlaceOrder()
        {
            return (from p in Products.AllDrinks()
                   select p.Name).ToList();
        }

        public string Default1PlaceOrder()
        {
            return "John Doe";
        }
        #endregion


        #region Add
        public Order Add(Order order, Product addition)
        {
            var orderAddition = Container.NewTransientInstance<OrderAddition>();
            orderAddition.Order = order;
            orderAddition.Product = addition;
            Container.Persist(ref orderAddition);
            order.Additions.Add(orderAddition);
            return order;
        }
        public IList<Product> Choices1Add()
        {
            return Products.AllAdditions().ToList();
        }
        public string ValidateAdd(Order order)
        {
            return order.BaristaState == (byte)OrderBaristaStates.OrderPlaced ? null : "Barista is already preparing your order";
        }
        public string ValidateAdd(Product addition)
        {
            return addition.Addition ? null : "Not an addition";
        }

        #endregion
    }
}
