<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>
<html>
<head runat="server">
    <title>Index</title>
</head>
<body>
    <div>
        <p>
            The idea of this webapp is to provide a mechanism by which end-to-end tests can
            manage the test environment. It is not part of the main app because it 
            is not intended to be deployed into production.</p>
            <ul>
                <li id="fixtures">
                    <p>Database Fixtures:</p>
                    <ul>
                        <li class="coffeeShop">
                            <%: Html.ActionLink("reset coffeeshop", "ResetCoffeeShop", "Fixtures") %>            
                        </li>
                    </ul>
                </li>
                <li id="clock">
                    <p>Clock:</p>
                    <ul>
                        <li>
                            <p><i>not yet implemented</i></p>
                        </li>
                    </ul>
                </li>
                <!--
                <li id="stylesheet">
                    <p>Stylesheet:</p>
                    <ul>
                        <li class="disable">
                            <%: Html.ActionLink("disable stylesheet", "Disable", "Stylesheet") %>            
                        </li>
                        <li class="enable">
                            <%: Html.ActionLink("enable stylesheet", "Enable", "Stylesheet") %>            
                        </li>
                    </ul>
                </li>
                -->
            </ul>
        
    </div>
</body>
</html>
