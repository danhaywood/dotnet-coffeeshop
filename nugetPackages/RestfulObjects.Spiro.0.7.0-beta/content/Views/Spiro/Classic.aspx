<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
	<meta name="viewport" content="width=device-width" />
	<title>Spiro</title>
	   
	<link href="~/Content/NakedObjects.css" rel="stylesheet" type="text/css" />

</head>
<body style="cursor: auto;">
	<div class="page">
		<div id="header">
			<div id="title">
				<h1>Spiro - Classic</h1>
			</div>
		</div>
		
		<div id="main"></div>	
		
	</div>
	
	<script type="text/javascript">
	    var appPath = "<%: Request.ApplicationPath %>";
	</script>
	
	<script src="http://code.jquery.com/jquery-latest.js" type="text/javascript"></script>
    <script type="text/javascript" src="http://ajax.aspnetcdn.com/ajax/jQuery.ui/1.8.14/jQuery-ui.min.js"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/underscore.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/jsrender.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro-models.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro-template-helpers.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro-classic.js") %>"></script>
        <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro-classic-templates.js") %>"></script>
</body>
</html>
