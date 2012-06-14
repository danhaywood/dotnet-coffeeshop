using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{
    public partial class OrderAddition
    {
    
        #region Primitive Properties
        #region OrderNum (Int32)
    [MemberOrder(100)]
        public virtual int  OrderNum {get; set;}

        #endregion
        #region ProductSku (String)
    [MemberOrder(110), StringLength(8)]
        public virtual string  ProductSku {get; set;}

        #endregion

        #endregion
        #region Navigation Properties
        #region Order (Order)
    		
    [MemberOrder(120)]
    	public virtual Order Order {get; set;}

        #endregion
        #region Product (Product)
    		
    [MemberOrder(130)]
    	public virtual Product Product {get; set;}

        #endregion

        #endregion
    }
}
