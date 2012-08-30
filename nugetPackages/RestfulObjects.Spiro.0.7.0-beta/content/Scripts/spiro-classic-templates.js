//This set of templates render the views in Spiro - Classic in a format recognised by the NakedObjects.css
//resulting in a UI that emulates the look and feel of the Naked Objects MVC 

$(function () {

    // TODO - Fix ids - not alaways unique at the moment (eg action ids) - need to be scoped in same way as MVC

     $.templates("serviceMenu",
        "<div class='nof-menuname'>{{:title}}</div>" +
            "<div class='nof-menuitems'>" +
                "{{for ~getFields(members) }}" +
                    "{{if value.disabledReason }}" +
                        "<div class='nof-action' title='{{:value.disabledReason}}'>{{:value.extensions.friendlyName}}</div>" +
                            "{{else}}" +
                                "<form class='nof-action' id='{{:value.id}}'><div><button>{{:value.extensions.friendlyName}}</button></div></form>" +
                                    "{{/if}}" +
                                        "{{/for}}");

    $.templates("subMenu",
        "<div class='nof-menuname'>{{:extensions.friendlyName}}</div>" +
            "<div class='nof-submenuitems'></div>");

    $.templates("subMenuItem",
        "{{if ~isFindAction(#data, ~returnType) }}" +
            "<form class='nof-action' id='{{:id}}'><div><button>{{:extensions.friendlyName}}</button></div></form>" +
                "{{/if}}");

    $.templates("dialog",
        "<div class='nof-object><a></a></div>" +
            "<div class='nof-actionname'>{{:extensions.friendlyName}}</div>" +
                "<form class='nof-dialog'>" +
                    "<div class='nof-parameterlist'>" +
                        "{{for parameters}}" +
                            "<div class='nof-parameter' id={{:name}}  >" +
                                "<label>{{:extensions.friendlyName}}:</label>" +
                                    "{{if ~isScalar(extensions.returnType)}}" +
                                        "<div class='nof-value'><input></input>" +
                                            "{{else}}" +
                                                "<div class='nof-object' data-type='{{:extensions.returnType}}' >" +
                                                    "{{/if}}" +
                                                        "<span class='nof-mandatory-field-indicator'>{{if extensions.optional === false}}'*'{{/if}}</span>" +
                                                            "</div>" +
                                                                "</div>" +
                                                                    "{{/for}}" +
                                                                        "</div>" +
                                                                            "<button class='nof-ok'>OK</button>" +
                                                                                "</form>" +
                                                                                    "<form class='nof-action'>" +
                                                                                        "<div><button class='nof-cancel'>Cancel</button></div>" +
                                                                                            "</form>");

    $.templates("findDialog",
        "<div class='nof-actionname'>{{:extensions.friendlyName}}</div>" +
            "<div class='nof-parameterlist'>" +
                "{{for parameters}}" +
                    "<div class='nof-parameter' id={{:name}}  >" +
                        "<label>{{:extensions.friendlyName}}:</label>" +
                            "{{if ~isScalar(extensions.returnType)}}" +
                                "<div class='nof-value'><input></input>" +
                                    "{{else}}" +
                                        "<div class='nof-object'>" +
                                            "{{/if}}" +
                                                "<span class='nof-mandatory-field-indicator'>{{if extensions.optional === false}}'*'{{/if}}</span>" +
                                                    "</div>" +
                                                        "</div>" +
                                                            "{{/for}}" +
                                                                "</div>" +
                                                                    "<button class='nof-ok'>OK</button>" +
                                                                        "<form class='nof-action'>" +
                                                                            "<div><button class='nof-cancel'>Cancel</button></div>" +
                                                                                "</form>");

    $.templates("errorTemplate",
        "<h2>{{:message}}</h2><p>{{:stackTrace}}</p>");

    $.templates("object",
        "<div class='nof-object'><img src='/Content/Default.png'' alt=''>{{:title}}</div>");

    // todo extract commonality for service menu into common template 
    $.templates("menu",
        "<div id='{{shortName:domainType}}-Actions'  class='nof-menu'>" +
            "<div class='nof-menuname'>Actions</div>" +
                "<div class='nof-menuitems'>" +
                    "{{for ~getActions(members) }}" +
                        "<form class='nof-action' id='{{:value.id}}'><div><button>{{:value.extensions.friendlyName}}</button></div></form>" +
                            "{{/for}}" +
                                "</div>" +
                                    "</div>");


//    $.templates("viewProperty",
//        "{{if !~isEdit && ~isScalar(value.extensions.returnType) tmpl='viewScalarProperty'/}}" +
//        "{{if ~isEdit && ~isScalar(value.extensions.returnType) tmpl='editScalarProperty'/}}" +
//        "{{if !~isEdit && ~isReference(value.extensions.returnType) tmpl='viewReferenceProperty'/}}" +
//        "{{if ~isEdit && ~isReference(value.extensions.returnType) tmpl='editReferenceProperty'/}}" +
//        "{{if !~isEdit && ~isCollection(value.extensions.returnType) tmpl='viewCollectionProperty'/}}" +
//        "{{if ~isEdit && ~isCollection(value.extensions.returnType) tmpl='editCollectionProperty'/}}"
//    );


    $.templates("viewScalarProperty",
        "<label>{{:extensions.friendlyName}}</label>" +
            "<div class='nof-value'>{{if extensions.format == 'date-time'}}" +
                "{{formattedDateTime:value}}" +
                    "{{else}}" +
                        "{{formattedScalar:value}}" +
                            "{{/if}}</div>" );

    $.templates("editScalarProperty",
        "<label>{{:extensions.friendlyName}}</label>" +
            "{{if disabledReason}}" +
                "<div class='nof-value'>{{if extensions.format == 'date-time'}}" +
                    "{{formattedDateTime:value}}" +
                        "{{else}}" +
                            "{{formattedScalar:value}}" +
                                "{{/if}}</div>" +
                                    "{{else}}" +
                                        "<div class='nof-value'><input  {{if extensions.format == 'date-time'}}class='date' value='{{formattedDateTime:value}} {{else}} value='{{formattedScalar:value}}{{/if}}  '/></div>" +
                                            "{{/if}}");

    $.templates("viewReferenceProperty",
        "<label>{{:extensions.friendlyName}}</label>" +
            "<div class='nof-object' data-type='{{:extensions.returnType}}'>" +
                "{{if value !== null }}" +
                    "<img src='/Content/Default.png' alt=''>" +
                        "<a id='{{:id}}'  href='{{:value.href}}'>{{:value.title}}</a>" +
                            "<form  id='{{:id}}' ><div><button class='nof-minimize' style='display: none;'>Collapse</button><button class='nof-maximize' style='display: inline';>Expand</button></div></form>" +
                                "{{/if}}" +
                                    "</div>");

    $.templates("editReferenceProperty",
        "<label>{{:extensions.friendlyName}}</label>" +
            "<div class='nof-object' data-type='{{:extensions.returnType}}' {{if ~hasFinder(#data)}}data-hasFinder='true'{{/if}} >" +
                "{{if value !== null }}" +
                    "<img src='/Content/Default.png' alt=''>" +
                        "<a id='{{:id}}' href='{{:value.href}}'>{{:value.title}}</a>" +
                            "{{/if}}" +
                                "</div>");

    $.templates("viewCollectionProperty",
        "<label>{{:extensions.friendlyName}}</label>" +
            "<div class='nof-collection-summary'>" +
                "<form id='{{:id}}'><div><button class='nof-summary' style='display: none;' >Summary</button><button  class='nof-list'>List</button><button  class='nof-table'>Table</button></div></form>" +
                    "<div class='nof-object'>{{if size === 0}}No{{else}}{{:size}}{{/if}} {{:extensions.pluralName}}</div>" +
                        "</div>");

    $.templates("inlineCollectionList",
        "<tbody>" +
            "{{for #data}}" +
                "<tr><td><div class='nof-object'><img src='/Content/Default.png' alt=''/><a  href='{{:href}}'>{{:title}}</a></div></td></tr>" +
                    "{{/for}}" +
                        "</tbody>");

    $.templates("inlineCollectionTable",
        "<tbody>" +        
            "<tr></tr>" +                   
                "</tbody>");


//    $.templates("property", "{{for ~getProperties(members)  tmpl='viewProperty'/}}");

    $.templates("table",
        "<div class='nof-object'>Viewing {{: ~count}} of {{: ~count}}</div>" +
            "<form class='nof-action'><div></div></form>");


    $.templates("row",
        "<td><div class='nof-object'><img/><a id='{{:instanceId}}' class='selfLink' href='{{: ~selfLink}}'>{{:title}}</a></div></td>" +
            "{{for ~getProperties(members)}}" +
                "{{if ~isScalar(value.extensions.returnType)}}<td><div class='nof-value'>" +    
                    "{{if value.extensions.format == 'date-time'}}" +
                        "{{formattedDateTime:value.value}}" +
                            "{{else}}" +
                                "{{:value.value}}" +
                                    "</div>{{/if}}" +
                                        "</div></td>{{/if}}" +
                                            "{{if ~isReference(value.extensions.returnType)}}<td><div class='nof-object'>" +
                                                "{{if value.value !== null }}" +
                                                    "<img src='/Content/Default.png' alt=''>" +
                                                        "<a  class='refLink'  id='{{:value.id}}'  href='{{:value.value.href}}'>{{:value.value.title}}</a>" +
                                                            "{{/if}}" +
                                                                "</div></td>{{/if}}" +
                                                                    "{{if ~isCollection(value.extensions.returnType)}}<td>" +
                                                                        "<div class='nof-object'>{{if value.size === 0}}No{{else}}{{:value.size}}{{/if}} {{:value.extensions.pluralName}}</div>" +
                                                                            "</td>{{/if}}" +
                                                                                "{{/for}}");


    $.templates("header",
        "<th></th>" +
            "{{for ~getProperties(members)}}" +
                "<th>{{:key}}</th>" +
                    "{{/for}}");


    $.templates("inlineList",
        "<table>" +
            "<tbody>" +
                "{{for #data}}" +
                    "<tr><td><div>{{:title}}<a href='{{:href}}'>Details</a><button>Select</button></div></td></tr>" +
                        "{{/for}}" +
                            "</tbody>" +
                                "</table>");

    $.templates("inlineTable",
        "<table>" +
            "<tbody>" +             
                "</tbody>" +
                    "</table>");
});