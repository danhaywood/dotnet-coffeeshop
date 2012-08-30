//  Spiro - Classic is a generic client for Restful Objects

$(function () {

    var home;

    var DomainObjectListItemView = Backbone.View.extend({
        tagName: "tr",

        initialize: function () {
            _.bindAll(this, 'render', 'link', 'refLink');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click .selfLink": "link",
            "click .refLink": "refLink"
        },

        link: function (e) {

            var view = new DomainObjectView({ model: this.model });
            view.parentEl = $("#main");
            view.parentEl.html("");
            view.render();
            return false;
        },

        refLink: function (e) {

            var selectedModel = this.model.getReferencePropertyValue(e.currentTarget.id);
            var view = new DomainObjectView({ model: selectedModel });
            view.parentEl = $("#main");
            view.parentEl.html("");
            selectedModel.fetch();
            return false;
        },

        render: function () {
            this.$el.html($.render.row(this.model.toJSON(), { selfLink: this.model.url }));

            $(this.parentEl).append(this.$el);
            $(this.parentEl).find("tr:first").html($.render.header(this.model.toJSON()));


            return this;
        }
    });


    var ListTableView = Backbone.View.extend({
        tagName: "div",
        className: "nof-collection-table",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            $(this.parentEl).find(".nof-collection-table").remove();

            $(this.el).html($.render.inlineTable(""));
            $(this.parentEl).append($(this.el));

            _.each(this.model.models, function (itemLink) {
                var itemModel = itemLink.getTarget();
                var item = new DomainObjectListItemView({ model: itemModel });
                item.parentEl = $(this.el).find("tbody");
                itemModel.fetch();
            }, this);


            return this;
        }
    });

    var DomainObjectListView = Backbone.View.extend({
        tagName: "div",
        className: "nof-standalonetable",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click .selfLink": "link"
        },

        link: function (e) {

            // find matching model 

            var selectedLink = _.find(this.model.models, function (i) {
                return i.get("href") === e.currentTarget.href;
            });

            var selectedModel = selectedLink.getTarget();
            var view = new DomainObjectView({ model: selectedModel });
            view.parentEl = $("#main");
            selectedModel.fetch();
            return false;
        },

        render: function () {
            this.$el.html($.render.table("", { count: this.model.models.length.toString(), dt: "" }));

            $("#main").html(this.$el);

            var view = new ListTableView({ model: this.model });
            view.parentEl = this.$el.find("> form > div");
            view.render();


            return this;
        }
    });


    var DomainObjectLinkView = Backbone.View.extend({
        tagName: "a",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            this.$el.attr("href", this.model.url());
            this.$el.html(this.model.get("title"));

            // clear any existing links or warnings 
            $(this.parentEl).find(" > a").remove();
            $(this.parentEl).find(" > img").remove();
            $(this.parentEl).find(".nof-collection-list").remove();
            $(this.parentEl).find(".field-validation-error").remove();

            $(this.parentEl).prepend(this.$el); // before mandatory ind ie '*' 
            $(this.parentEl).prepend("<img src='/Content/Default.png' alt=''>");


            return this;
        }
    });


    var ListLinkView = Backbone.View.extend({
        tagName: "div",
        className: "nof-collection-list",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            $(this.parentEl).find(".nof-collection-list").remove();

            $(this.el).append($.render.inlineList(this.model.toJSON()));
            $(this.parentEl).append($(this.el));


            return this;
        }
    });


    var PropertyValueView = Backbone.View.extend({
        tagName: "div",
        className: "nof-property",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            var member = this.model.get("members")[this.memberId];

            if (this.model.get("editMode")) {
                this.$el.append($.render.editScalarProperty(member));
            } else {
                this.$el.append($.render.viewScalarProperty(member));
            }

            this.$el.attr("id", member.id);

            return this;
        }
    });


    var PropertyReferenceView = Backbone.View.extend({
        tagName: "div",
        className: "nof-property",

        initialize: function () {
            this.mode = "minimized";
            _.bindAll(this, 'render', "link");
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click :button": "select",
            "click .nof-object > a": "link"
        },

        link: function (e) {

            // find matching model 

            var selectedModel = this.model.getReferencePropertyValue(e.currentTarget.id);
            var view = new DomainObjectView({ model: selectedModel });
            view.parentEl = $("#main");
            view.parentEl.html("");

            selectedModel.fetch();
            return false;
        },


        maximize: function () {
            this.mode = "maximized";
            this.render();
        },

        minimize: function () {
            this.mode = "minimized";
            this.render();
        },

        select: function (e) {

            if (e.currentTarget.className === "nof-maximize") {
                this.maximize();
            } else if (e.currentTarget.className === "nof-minimize") {
                this.minimize();
            }
            return false;
        },

        render: function () {
            var member = this.model.get("members")[this.memberId];
            if (this.model.get("editMode")) {
                this.$el.html($.render.editReferenceProperty(member));
            } else {
                this.$el.html($.render.viewReferenceProperty(member));

                if (this.mode === "minimized") {
                    this.$el.find(".nof-maximize").show();
                    this.$el.find(".nof-minimize").hide();

                    this.$el.find(".nof-propertylist").remove();
                }
                if (this.mode === "maximized") {
                    this.$el.find(".nof-maximize").hide();
                    this.$el.find(".nof-minimize").show();

                    var propertyValue = this.model.getReferencePropertyValue(this.$el.find("form").attr("id"));
                    var view = new DomainObjectPropertiesView({ model: propertyValue });
                    view.parentEl = this.$el.find(".nof-object");
                    propertyValue.fetch();
                }

            }

            this.$el.attr("id", member.id);


            return this;
        }
    });

    var InlineListCollectionView = Backbone.View.extend({
        tagName: "table",

        initialize: function () {

            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click .nof-object > a": "link"
        },

        link: function (e) {


            var selectedLink = _.find(this.model.models, function (i) {
                return i.get("href") === e.currentTarget.href;
            });

            var selectedModel = selectedLink.getTarget();
            var view = new DomainObjectView({ model: selectedModel });
            view.parentEl = $("#main");
            view.parentEl.html("");
            selectedModel.fetch();
            return false;
        },


        render: function () {
            this.$el.html($.render.inlineCollectionList(this.model.toJSON()));
            $(this.parentEl).append(this.$el);


            return this;
        }
    });


    var InlineTableCollectionView = Backbone.View.extend({
        tagName: "table",

        initialize: function () {

            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            this.$el.html($.render.inlineCollectionTable(""));

            $(this.parentEl).append(this.$el);

            _.each(this.model.models, function (itemLink) {
                var itemModel = itemLink.getTarget();
                var item = new DomainObjectListItemView({ model: itemModel });
                item.parentEl = $(this.el).find("tbody");
                itemModel.fetch();
            }, this);


            return this;
        }
    });


    var PropertyCollectionView = Backbone.View.extend({
        tagName: "div",
        className: "nof-property",

        initialize: function () {
            this.mode = "summary";
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click :button": "select"
        },

        summarize: function () {
            this.mode = "summary";
            this.render();
        },

        listify: function () {
            this.mode = "list";
            this.render();
        },

        tabulate: function () {
            this.mode = "table";
            this.render();
        },

        select: function (e) {



            if (e.currentTarget.className === "nof-summary") {
                this.summarize(e);
            } else if (e.currentTarget.className === "nof-list") {
                this.listify(e);
            } else if (e.currentTarget.className === "nof-table") {
                this.tabulate(e);
            }

            return false;
        },

        render: function () {
            var member = this.model.get("members")[this.memberId];
            var propertyValue, view;

            this.$el.html($.render.viewCollectionProperty(member));

            var cDiv = this.$el.find(".nof-collection-summary, .nof-collection-list, .nof-collection-table");

            if (this.mode === "summary") {
                this.$el.find(".nof-summary").hide();
                this.$el.find(".nof-list").show();
                this.$el.find(".nof-table").show();

                cDiv.addClass("nof-collection-summary");
                cDiv.removeClass("nof-collection-list");
                cDiv.removeClass("nof-collection-table");
            }

            if (this.mode === "list") {
                this.$el.find(".nof-summary").show();
                this.$el.find(".nof-list").hide();
                this.$el.find(".nof-table").show();

                cDiv.addClass("nof-collection-list");
                cDiv.removeClass("nof-collection-summary");
                cDiv.removeClass("nof-collection-table");

                this.$el.find(".nof-object").remove();

                propertyValue = this.model.getCollectionPropertyValue(this.$el.find("form").attr("id"));
                view = new InlineListCollectionView({ model: propertyValue });
                view.parentEl = cDiv;
                propertyValue.fetch();
            }

            if (this.mode === "table") {
                this.$el.find(".nof-summary").show();
                this.$el.find(".nof-list").show();
                this.$el.find(".nof-table").hide();

                cDiv.addClass("nof-collection-table");
                cDiv.removeClass("nof-collection-list");
                cDiv.removeClass("nof-collection-summary");

                this.$el.find(".nof-object").remove();

                propertyValue = this.model.getCollectionPropertyValue(this.$el.find("form").attr("id"));
                view = new InlineTableCollectionView({ model: propertyValue });
                view.parentEl = cDiv;
                propertyValue.fetch();


            }

            this.$el.attr("id", member.id);


            return this;
        }
    });


    var DomainObjectPropertiesView = Backbone.View.extend({
        tagName: "div",
        className: "nof-propertylist",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        isScalar: function (member) {
            var type = member.extensions.returnType;
            return type === "string" || type === "number" || type === "boolean" || type === "integer";
        },

        render: function () {

            _.each(this.model.get("members"), function (member) {

                var view;
                if (member.memberType === "property" && this.isScalar(member)) {
                    view = new PropertyValueView({ model: this.model });
                } else if (member.memberType === "property") {
                    view = new PropertyReferenceView({ model: this.model });
                } else if (member.memberType === "collection") {
                    view = new PropertyCollectionView({ model: this.model });
                } else {
                    // action ignore 
                }

                if (view) {
                    view.memberId = member.id;
                    this.$el.append(view.render().el);
                }
            }, this);

            if (this.parentEl) {
                this.parentEl.append(this.$el);
            }



            return this;
        }
    });


    var DomainObjectView = Backbone.View.extend({
        tagName: "div",
        className: "nof-objectview",


        initialize: function () {
            _.bindAll(this, 'renderEdit', 'renderView', 'render', 'requestFailed', 'requestSucceeded');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.renderView);
        },

        events: {
            "click :button": "select"
        },

        edit: function () {
            this.model.setEditMode(true);
            return false;
        },

        view: function () {
            this.model.setEditMode(false);
            return false;
        },

        toISODate: function (d) {

            function pad(n) {
                return n < 10 ? '0' + n : n;
            }

            if (isNaN(d.getTime())) {
                return "";
            }

            return d.getUTCFullYear() + '-'
                + pad(d.getUTCMonth() + 1) + '-'
                    + pad(d.getUTCDate()) + 'T'
                        + pad(d.getUTCHours()) + ':'
                            + pad(d.getUTCMinutes()) + ':'
                                + pad(d.getUTCSeconds()) + 'Z';
        },

        save: function () {

            var map = this.model.getArgumentMap();

            for (attr in map.attributes) {
                var property = $(".nof-property#" + attr);
                var input = property.find('.nof-value > :input');
                var newValue = "";

                if (input.length > 0) {
                    newValue = input.val();

                    if (input.hasClass('date')) {
                        var dt = new Date(newValue);
                        newValue = this.toISODate(dt);
                    }
                    newValue = $.trim(newValue);

                } else {
                    var link = property.find(".nof-object > a");

                    if (link.length > 0) {
                        newValue = { "href": link.attr("href") };
                    }
                }
                map.get(attr).value = newValue;
            }

            map.bind('requestFailed', this.requestFailed);
            map.bind('requestSucceeded', this.requestSucceeded);

            map.save();
            return false;
        },

        requestSucceeded: function () {
            this.model.setEditMode(false);
        },

        requestFailed: function (resp) {
            this.model.setEditMode(true);

            if (resp.statusCode === 500) {
                $("#main").html($.render.errorTemplate(resp.model.toJSON()));
            } else {
                $(".field-validation-error").remove();

                for (parm in resp.model.attributes) {
                    var key = parm;
                    var value = resp.model.attributes[key].value;
                    var msg = resp.model.attributes[key].invalidReason;

                    if (msg) {
                        var nofvalue = $("#" + key).find(".nof-value, .nof-object");
                        nofvalue.append($("<span class='field-validation-error'>" + msg + "</span>"));
                    }
                }
            }
        },

        select: function (e) {



            // todo chnage to map 

            if (e.currentTarget.className === "nof-edit") {
                this.edit();
            } else if (e.currentTarget.className === "nof-cancel") {
                this.view();
            } else if (e.currentTarget.className === "nof-save") {
                this.save();
            } else {
                var objectAction = this.model.getObjectAction(e.currentTarget.form.id);
                var dialogView = new DialogView({ model: objectAction });
                objectAction.fetch();
            }

            return false;
        },

        renderView: function () {
            this.model.setEditMode(false);
        },

        renderEdit: function () {
            this.model.setEditMode(true);
        },

        render: function () {

            if (Object.keys(this.model.attributes).length === 0) {
                $("#main").html("");

                return this;
            }

            if (this.model.get("editMode")) {
                this.$el.addClass("nof-objectedit");
                this.$el.removeClass("nof-objectview");
            }
            else {
                this.$el.removeClass("nof-objectedit");
                this.$el.addClass("nof-objectview");
            }

            this.$el.html($.render.object(this.model.toJSON()));

            if (!this.model.get("editMode")) {
                this.$el.append($.render.menu(this.model.toJSON()));
            }

            var pView = new DomainObjectPropertiesView({ model: this.model });
            this.$el.append(pView.render().el);

            if (this.model.get("editMode")) {
                this.$el.append("<form class='nof-action'><div><button class='nof-save'>Save</button></div></form>");
                this.$el.append("<form class='nof-action'><div><button class='nof-cancel'>Cancel</button></div></form>");
            } else {
                this.$el.append("<form class='nof-action'><div><button class='nof-edit'>Edit</button></div></form>");
            }

            this.$el.find(".nof-property > .nof-object[data-hasFinder]").each(function () {
                var serviceLinks = home.getServiceLinks();
                var findMenuView = new FindMenuView({ model: serviceLinks });
                findMenuView.parentEl = this;
                serviceLinks.fetch();
            });

            if ($(this.parentEl).find(".nof-objectview, .nof-objectedit").length == 0) {
                $(this.parentEl).html(this.$el);
            }

            $(this.parentEl).find(".date").datepicker();


            return this;
        }
    });

    var ResultView = Backbone.View.extend({
        tagName: "div",
        className: "nof-objectview",

        initialize: function () {
            _.bindAll(this, 'render', 'error');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
            this.model.bind('error', this.error);
            this.model.bind('requestFailed', this.requestFailed);
        },

        render: function () {
            var result = this.model.getResult();
            var resultType = this.model.get("resultType");

            // to do replace this with lookup table ? 
            if (result == null || resultType === "void") {
                $("#main").html("");
            } else if (resultType === "object") {

                if (this.showLink) {
                    var domainObjectLinkView = new DomainObjectLinkView({ model: result });
                    domainObjectLinkView.parentEl = this.parentEl;
                    domainObjectLinkView.render();
                } else {
                    var domainObjectView = new DomainObjectView({ model: result });
                    $("#main").html("");
                    domainObjectView.parentEl = $("#main");
                    domainObjectView.render();
                }
            } else if (resultType === "scalar") {
                alert("unsupported display of scalar");
            } else if (resultType === "list") {

                if (this.showLink) {
                    var listLinkListView = new ListLinkView({ model: result });
                    listLinkListView.parentEl = this.parentEl;
                    listLinkListView.render();
                } else {
                    var domainObjectListView = new DomainObjectListView({ model: result });
                    domainObjectListView.render();
                }
            }


            return this;
        },

        requestFailed: function (resp) {

            if (resp.statusCode === 500) {
                $("#main").html($.render.errorTemplate(resp.model.toJSON()));
            } else {
                $(".field-validation-error").remove();

                for (parm in resp.model.attributes) {
                    var key = parm;
                    var value = resp.model.attributes[key].value;
                    var msg = resp.model.attributes[key].invalidReason;

                    if (msg) {
                        var nofvalue = $("#" + key).find(".nof-value, .nof-object");
                        nofvalue.append($("<span class='field-validation-error'>" + msg + "</span>"));
                    }
                }
            }
        },

        error: function () {

        }
    });

    var FindDialogView = Backbone.View.extend({
        tagName: "div",
        className: "nof-actiondialog",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click :button.nof-ok": "ok",
            "click :button.nof-cancel": "cancel"
        },

        ok: function () {

            var result = this.model.getActionResult();

            var parms = $(".nof-parameter");

            parms.each(function () {
                var value = { "value": $(this).find(":input").val() };
                result.set(this.id, value);
            });

            var resultView = new ResultView({ model: result });
            resultView.showLink = true;
            resultView.parentEl = $(this.parentEl);
            result.fetch();

            return false;
        },

        cancel: function () {
            return false;
        },

        render: function () {

            if (this.model.getHasArguments()) {
                this.$el.html($.render.findDialog(this.model.toJSON()));
                $(this.parentEl).append(this.$el);
            } else {
                // if no parameters go straight though to invoke  
                var result = this.model.getActionResult();
                var resultView = new ResultView({ model: result });
                resultView.showLink = true;
                resultView.parentEl = $(this.parentEl);
                result.fetch();
            }


            return this;
        }
    });

    var FindSubMenuItemView = Backbone.View.extend({
        tagName: "div",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {

            var mi = $.render.subMenuItem(this.model.toJSON(), { returnType: this.dataType });

            if (mi) {
                $(this.parentEl).closest(".nof-submenu").show();
                $(this.parentEl).append(mi);
            }


            return this;
        }
    });


    var FindSubMenuView = Backbone.View.extend({
        tagName: "div",
        className: "nof-submenu",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click :button": "select"
        },

        select: function (e) {

            var objectAction = this.model.getObjectAction(e.currentTarget.form.id);
            var dialogView = new FindDialogView({ model: objectAction });
            dialogView.parentEl = $(this.parentEl).closest(".nof-object");
            objectAction.fetch();

            return false;
        },

        render: function () {

            this.$el.html($.render.subMenu(this.model.toJSON()));
            $(this.parentEl).append(this.$el);

            this.$el.hide();

            _.each(this.model.getObjectActions(), function (i) {
                var view = new FindSubMenuItemView({ model: i });
                view.parentEl = $(this.el).find(".nof-submenuitems");
                view.dataType = this.dataType;
                i.fetch();
            }, this);


            return this;
        }
    });

    var FindMenuView = Backbone.View.extend({
        tagName: "div",
        className: "nof-menu",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },


        events: {
            "click :button": "remove"
        },

        remove: function (e) {
            $(this.parentEl).find(" > img").remove();
            $(this.parentEl).find(" > a").remove();
            return false;
        },


        render: function () {
            this.$el.html("<div class='nof-menuname'>Find</div><div class='nof-menuitems'><button class='nof-remove'>Remove</button></div>");
            $(this.parentEl).append(this.$el);

            _.each(this.model.models, function (link) {
                var service = link.getTarget();
                var findSubmenuView = new FindSubMenuView({ model: service });
                findSubmenuView.parentEl = $(this.el).find(".nof-menuitems");
                findSubmenuView.dataType = $(this.parentEl).attr("data-type");
                service.fetch();
            }, this);


            return this;
        }
    });

    var DialogView = Backbone.View.extend({
        tagName: "div",
        className: "nof-actiondialog",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click :button.nof-ok": "ok",
            "click :button.nof-cancel": "cancel"
        },

        ok: function () {

            var result = this.model.getActionResult();

            var parms = $(".nof-parameter");

            parms.each(function () {
                var val;
                var input = $(this).find(".nof-value > input");

                if (input.length > 0) {
                    val = input.val();
                } else {
                    var link = $(this).find(".nof-object > a");

                    if (link.length > 0) {
                        val = { "href": link.attr("href") };
                    } else {
                        val = "";
                    }
                }

                var value = { "value": val };
                result.set(this.id, value);
            });

            var resultView = new ResultView({ model: result });
            result.fetch();


            return false;
        },

        cancel: function () {
            return false;
        },

        render: function () {



            if (this.model.getHasArguments()) {
                this.$el.html($.render.dialog(this.model.toJSON()));

                this.$el.find(".nof-parameter > .nof-object").each(function () {
                    var serviceLinks = home.getServiceLinks();
                    var findMenuView = new FindMenuView({ model: serviceLinks });
                    findMenuView.parentEl = this;
                    serviceLinks.fetch();
                });

                $("#main").html(this.$el);
            } else {
                // if no parameters go straight though to invoke  
                var result = this.model.getActionResult();
                var resultView = new ResultView({ model: result });
                result.fetch();
            }


            return this;
        }
    });



    var ServiceMenuView = Backbone.View.extend({
        tagName: "div",
        className: "nof-menu",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        events: {
            "click :button": "select"
        },

        select: function (e) {
            var objectAction = this.model.getObjectAction(e.currentTarget.form.id);
            var dialogView = new DialogView({ model: objectAction });
            objectAction.fetch();
            return false;
        },

        render: function () {
            this.$el.html($.render.serviceMenu(this.model.toJSON()));
            this.$el.attr("id", this.model.get("serviceId"));
            $(this.parentEl).append(this.$el);

            return this;
        }
    });

    var MenuBarView = Backbone.View.extend({
        tagName: "div",
        className: "nof-servicelist",

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            _.each(this.model.models, function (link) {
                var service = link.getTarget();
                var serviceView = new ServiceMenuView({ model: service });
                serviceView.parentEl = this.$el;
                service.fetch();
            }, this);

            $("#header").append(this.$el);


            return this;
        }
    });


    var HomeView = Backbone.View.extend({

        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
        },

        render: function () {
            $("#main").html("This demo currently only works IE9+, and is being tested in Firefox 14");

            var serviceLinks = this.model.getServiceLinks();
            var menuBarView = new MenuBarView({ model: serviceLinks });
            serviceLinks.fetch();


            return this;
        }
    });


    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "home"
        },

        home: function () {
            home = new spiro.Home();
            var homeView = new HomeView({ model: home });
            home.fetch();
        }
    });

    var app = new AppRouter();

    Backbone.history.start();




});

window.onerror = function(msg, url, linenumber) {
    alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
    return true;
};

bindAjaxError = function() {
    $("div#main").ajaxError(function(e, xhr, settings) {
        //  errorDialog('Ajax Error', "Error in: " + settings.url + " \n" + "error:\n" + xhr.responseText);

        alert('ajax error');
    });
};



































































































































































