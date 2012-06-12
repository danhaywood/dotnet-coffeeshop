<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<System.String>" %>

<!DOCTYPE html>

<html>
<head runat="server">
    <title>OK</title>
</head>
<body>
    <div>
        <p><%= Model %></p>

        <p>
            <%= Html.ActionLink("Home", "Index", "Home")%>
        </p>
    </div>
</body>
</html>
