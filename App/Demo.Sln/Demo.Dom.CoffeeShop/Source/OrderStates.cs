namespace Demo.Dom.CoffeeShop
{
    public enum OrderCustomerStateEnum : byte
    {
        Placed,  // 0
        BaristaPreparingDrink, // 1
        Paid,     // 2
        BaristaReleasedDrink, // 3
        DrinkReceived, // 4
        OrderCancelled // 5
    }

    public enum OrderBaristaStateEnum : byte
    {
        InQueue,  // 0
        ChosenAndBeingPrepared,  // 1
        DrinkMade,    // 2
        DrinkReleased, // 3
        OrderCancelled // 4
    }

}
