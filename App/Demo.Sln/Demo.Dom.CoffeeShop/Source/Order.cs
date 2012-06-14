using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{

    [MetadataType(typeof(Order_Metadata))]
    [IconName("icons/Order.png")]
    public partial class Order
    {
        #region Title
        public string Title()
        {
            var t = new TitleBuilder();
            t.Append(DrinkSku != null ? Drink.Title() : "Order");
            t.Append(" for ").Append(CustomerName);
            return t.ToString();
        }
        #endregion

        #region Add (if order placed, not yet being prepared)
        [MemberOrder(10)]
        public Order Add(Product addition)
        {
            var orderAddition = Container.NewTransientInstance<OrderAddition>();
            orderAddition.Order = this;
            orderAddition.Product = addition;
            Container.Persist(ref orderAddition);
            Price += orderAddition.Product.Price; 
            Additions.Add(orderAddition);

            return this;
        }
        public Boolean HideAdd(Product addition)
        {
            return !IsCustomerState(OrderCustomerStateEnum.Placed);
        }
        public IList<Product> Choices0Add()
        {
            return Products.AllAdditions().ToList();
        }
        public Product DefaultAdd(Product addition)
        {
            return Choices0Add().FirstOrDefault();
        }
        public string ValidateAdd(Product addition)
        {
            return addition.Addition ? null : "Not an addition";
        }
        #endregion

        #region Remove (if order placed, not yet being prepared)
        [MemberOrder(20)]
        public Order Remove(Product addition)
        {
            var orderAddition = Additions.FirstOrDefault(a => a.Product == addition);
            if (orderAddition == null) return this;
            Price -= orderAddition.Product.Price;
            Container.DisposeInstance(orderAddition);
            Additions.Remove(orderAddition);

            return this;
        }
        public Boolean HideRemove(Product addition)
        {
            return !IsCustomerState(OrderCustomerStateEnum.Placed);
        }
        public IList<Product> Choices0Remove()
        {
            return Additions.Select(a => a.Product).ToList();
        }
        public Product DefaultRemove(Product addition)
        {
            return Choices0Remove().FirstOrDefault();
        }
        public string ValidateRemove(Product addition)
        {
            var orderAddition = Additions.FirstOrDefault(a => a.Product == addition);
            return orderAddition == null ? "No such addition" : null;
        }
        #endregion

        #region Cancel (if order placed, not yet being prepared)
        [MemberOrder(30)]
        public Order Cancel()
        {
            CustomerState = (byte) OrderCustomerStateEnum.OrderCancelled;
            BaristaState = (byte) OrderBaristaStateEnum.OrderCancelled;

            return this;
        }
        public Boolean HideCancel()
        {
            return !IsCustomerState(OrderCustomerStateEnum.Placed, OrderCustomerStateEnum.OrderCancelled);
        }
        #endregion

        #region Pay (if order placed or being prepared)
        [MemberOrder(40)]
        public Order Pay()
        {
            
            if (BaristaStateEnum == OrderBaristaStateEnum.DrinkMade)
            {
                CustomerStateEnum = OrderCustomerStateEnum.BaristaReleasedDrink;
                BaristaStateEnum = OrderBaristaStateEnum.DrinkReleased;
            }
            else
            {
                CustomerStateEnum = OrderCustomerStateEnum.Paid;    
            }
            return this;
        }
        public Boolean HidePay()
        {
            return !IsCustomerState(OrderCustomerStateEnum.Placed, OrderCustomerStateEnum.BaristaPreparingDrink);
        }
        #endregion

        #region ReceiveDrink (if drink released)
        [MemberOrder(50)]
        public Order ReceiveDrink()
        {
            CustomerState = (byte) OrderCustomerStateEnum.DrinkReceived;

            return this;
        }
        public Boolean HideReceiveDrink()
        {
            return !IsCustomerState(OrderCustomerStateEnum.BaristaReleasedDrink);
        }
        #endregion

        #region State Helpers
        internal OrderCustomerStateEnum CustomerStateEnum
        {
            get { return (OrderCustomerStateEnum)CustomerState; }
            set { CustomerState = (byte) value;  }
        }
        internal OrderBaristaStateEnum BaristaStateEnum
        {
            get { return (OrderBaristaStateEnum)BaristaState; }
            set { BaristaState = (byte) value; }
        }

        internal bool IsCustomerState(params OrderCustomerStateEnum[] stateEnum)
        {
            return stateEnum.Any(ocs => CustomerStateEnum == ocs);
        }
        internal bool IsBaristaState(params OrderBaristaStateEnum[] stateEnum)
        {
            return stateEnum.Any(obs => BaristaStateEnum == obs);
        }
        #endregion

        #region Injected services
        [NakedObjectsIgnore]
        public IDomainObjectContainer Container { set; protected get; }
        [NakedObjectsIgnore]
        public ProductCatalog Products { set; protected get; }
        #endregion
    }

    public partial class Order_Metadata
    {
        #region DrinkSku (hidden)
        [Hidden]
        public string DrinkSku { get; set; }
        #endregion

        #region CustomerState (disabled, enum mapping)
        [Disabled]
        [EnumDataType(typeof(OrderCustomerStateEnum))]
        public byte CustomerState { get; set; }
        #endregion

        #region BaristaState (disabled, enum mapping)
        [Disabled]
        [EnumDataType(typeof(OrderBaristaStateEnum))]
        public byte BaristaState { get; set; }
        #endregion

        #region Product (disabled)
        [Disabled]
        public int OrderNum { get; set; }
        #endregion

        #region Drink (disabled)
        [Disabled]
        public Product Drink { get; set; }
        #endregion

        #region Price (disabled)
        [Disabled]
        public Decimal Price { get; set; }
        #endregion

        #region PlacedOn (disabled)
        [Disabled]
        public DateTime PlacedOn { get; set; }
        #endregion
    }
}
