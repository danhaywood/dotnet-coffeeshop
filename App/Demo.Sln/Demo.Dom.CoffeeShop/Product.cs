using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using NakedObjects;

namespace Demo.Dom.CoffeeShop
{
    public partial class Product
    {
    
        #region Primitive Properties
        #region Sku (String)
    [MemberOrder(100), StringLength(8)]
        public virtual string  Sku {get; set;}

        #endregion
        #region Name (String)
    [MemberOrder(110), StringLength(30)]
        public virtual string  Name {get; set;}

        #endregion
        #region Price (Decimal)
    [MemberOrder(120)]
        public virtual decimal  Price {get; set;}

        #endregion
        #region Addition (Boolean)
    [MemberOrder(130)]
        public virtual bool  Addition {get; set;}

        #endregion

        #endregion
    }
}
