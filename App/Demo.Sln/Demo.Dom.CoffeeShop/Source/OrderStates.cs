namespace Demo.Dom.CoffeeShop
{
    public enum OrderCustomerStates : byte
    {
        OrderPlaced,  // 0
        OrderPaid,    // 1
        DrinkReceived // 2
    }

    public enum OrderBaristaStates : byte
    {
        OrderPlaced,  // 0
        OrderChosen,  // 1
        DrinkMade,    // 2
        DrinkReleased // 3
    }

}
