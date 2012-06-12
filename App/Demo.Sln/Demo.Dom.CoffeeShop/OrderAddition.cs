using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{
    public partial class OrderAddition
    {
    
        #region Primitive Properties
        #region ProductSku (String)
    [MemberOrder(100), StringLength(8)]
        public virtual string  ProductSku {get; set;}

        #endregion
        #region OrderId (Guid)
    [MemberOrder(110)]
        public virtual System.Guid  OrderId {get; set;}

        #endregion

        #endregion
        #region Navigation Properties
        #region Product (Product)
    		
    [MemberOrder(120)]
    	public virtual Product Product {get; set;}

        #endregion
        #region Order (Order)
    		
    [MemberOrder(130)]
    	public virtual Order Order {get; set;}

        #endregion

        #endregion
    }
}
