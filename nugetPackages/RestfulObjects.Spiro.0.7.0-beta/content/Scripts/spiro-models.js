var spiro = (function () {

    var spiroInternal = {};

    spiroInternal.ArgumentMap = Backbone.Model.extend({
        save: function (attributes, options) {
            spiroInternal.cursorWait();
            Backbone.Model.prototype.save.call(this, attributes, setupOptionsForObject(options, this));
        }
    });

    var setupOptionsForInvoke = function (options, parent) {
        options = options || {};
        options.error = function (originalModel, resp, iOptions) {
            var rs = $.parseJSON(resp.responseText);
            parent.trigger("requestFailed", { statusCode: resp.status, model: new spiroInternal.Invoke(rs) });
            spiroInternal.cursorClear();
        };

        options.success = function (originalModel, resp, iOptions) {
            spiroInternal.cursorClear();
        };

        return options;
    };

    var setupOptionsForCursor = function (options) {
        options = options || {};
        options.error = function () {
            spiroInternal.cursorClear();
        };

        options.success = function () {
            spiroInternal.cursorClear();
        };

        return options;
    };



    var setupOptionsForObject = function (options, parent) {
        options = options || {};
        options.error = function (originalModel, resp, iOptions) {
            var rs = $.parseJSON(resp.responseText);
            parent.trigger("requestFailed", { statusCode: resp.status, model: new spiroInternal.ArgumentMap(rs) });
            spiroInternal.cursorClear();
        };

        options.success = function (originalModel, resp, iOptions) {
            parent.trigger("requestSucceeded");
            spiroInternal.cursorClear();
        };

        return options;
    };

    // matches a action invoke resource 19.0 representation 
    spiroInternal.Invoke = Backbone.Model.extend({

        getResult: function () {
            var result = this.get("result");
            var resultType = this.get("resultType");

            if (resultType === "scalar") {
                return result.value;
            }
            if (resultType === "object") {
                return new spiroInternal.DomainObject(result);
            }
            if (resultType === "list") {
                if (result) {
                    return new spiroInternal.LinkList(result.value);
                }
                return null;
            }
            if (resultType === "void") {
                return null;
            }

            return null;
        },

        fetch: function (attributes, options) {
            spiroInternal.cursorWait();

            if (this.method === "GET") {
                var map = JSON.stringify(this.toJSON());
                var encodedMap = encodeURI(map);

                this.url = this.url + "?" + encodedMap;

                // ie super.fetch 
                Backbone.Model.prototype.fetch.call(this, setupOptionsForInvoke(options, this));
            }
            else if (this.method === "POST") {
                this.save(attributes, setupOptionsForInvoke(options, this));
            }
            else if (this.method === "PUT") {
                // set id so not new ? 
                this.save(attributes, setupOptionsForInvoke(options, this));
            }
        }
    });


    // matches an action representation 18.0 
    spiroInternal.ObjectAction = Backbone.Model.extend({
        getLinks: function () {
            return new spiroInternal.LinkList(this.get("links"));
        },

        getActionResult: function () {
            var links = this.getLinks();
            var resultsLink = _.find(links.models, function (i) {
                return i.targetType() === "urn:org.restfulobjects:repr-types/action-result";
            });
            return resultsLink.getTarget();
        },

        getHasArguments: function () {
            return this.get("extensions").hasParams;
        }

    });


    // matches a domain object representation 14.0 
    spiroInternal.DomainObject = Backbone.Model.extend({
        url: function () {

            if (!this.selfUrl) {

                var links = this.get("links");
                var selfLink = _.find(links, function (i) {
                    return i.rel === "self";
                });

                this.selfUrl = selfLink.href;
            }

            return this.selfUrl;
        },

        updateLink: function () {
            var links = this.get("links");
            var updateLk = _.find(links, function (i) {
                return i.rel === "urn:org.restfulobjects:rels/update";
            });

            return updateLk;
        },


        updateUrl: function () {
            return this.updateLink().href;
        },

        updateMap: function () {
            return this.updateLink().arguments;
        },

        getMemberLinks: function (id) {
            return new spiroInternal.LinkList(this.get("members")[id].links);
        },

        getMemberDetails: function (id, type) {
            var links = this.getMemberLinks(id);
            var detailsLink = _.find(links.models, function (i) {
                return i.targetType() === "urn:org.restfulobjects:repr-types/" + type;
            });

            if (detailsLink) {
                return detailsLink.getTarget();
            }
            return null;
        },

        getObjectAction: function (id) {
            return this.getMemberDetails(id, "object-action");
        },

        getReferencePropertyValue: function (id) {
            var link = new spiroInternal.Link(this.get("members")[id].value);
            return link.getTarget();
        },

        getCollectionPropertyValue: function (id) {
            return this.getMemberDetails(id, "object-collection");
        },

        getObjectActions: function () {
            var actions = [];

            for (id in this.get("members")) {
                var detailsTarget = this.getObjectAction(id);
                if (detailsTarget) {
                    actions.push(detailsTarget);
                }
            }

            return actions;
        },

        getArgumentMap: function () {
            var jsonMap = this.updateMap();
            var map = new spiroInternal.ArgumentMap(jsonMap);
            map.url = this.updateUrl();
            map.id = this.get("instanceId");

            for (member in map.attributes) {
                map.attributes[member].value = this.get("members")[member].value;
            }

            var parent = this;

            map.on("change", function () {
                parent.setFromArgumentMap(this);
            });

            return map;
        },

        setEditMode: function (flag) {
            this.set("editMode", flag);
        },

        setFromArgumentMap: function(map) {
            this.set(map.attributes);
        },

        fetch: function(attributes, options) {
            spiroInternal.cursorWait();
            // ie super.fetch 
            Backbone.Model.prototype.fetch.call(this, setupOptionsForCursor(options));
        }
    });


    // matches the Link representation 2.7
    spiroInternal.Link = Backbone.Model.extend({

        // the url that this link points to 
        targetUrl: function () {
            var href = this.get("href");
            return href;
        },

        // the media type that this link points to 
        targetType: function () {
            var type = this.get("type");
            var parms = type.split(";");

            for (var i = 0; i < parms.length; i++) {
                if ($.trim(parms[i]).substring(0, 7) === "profile") {
                    return parms[i].split("=")[1].replace(/\"/g, '');
                }
            }

            return "";
        },

        // the http method needed on the link
        method: function () {
            return this.get("method");
        },

        // get the object that this link points to 
        getTarget: function () {
            var matchingType = RepTypeToModel[this.targetType()];
            var target = new matchingType();
            target.url = this.targetUrl();
            target.method = this.method();
            return target;
        }

    });

    // matches a list representation 11.0 
    spiroInternal.LinkList = Backbone.Collection.extend({
        model: spiroInternal.Link,

        parse: function (response) {
            return response.value;
        }
    });

    // matches the home page representation  5.0 
    spiroInternal.Home = Backbone.Model.extend({
        url: appPath,

        serviceLinksUrl: function () {
            var links = this.get("links");
            var services = _.find(links, function (o) { return o.rel.indexOf("urn:org.restfulobjects:rels/services") != -1; });
            return services.href;
        },

        getServiceLinks: function () {
            var services = new spiroInternal.LinkList();
            services.url = this.serviceLinksUrl();
            return services;
        }
    });


    // map of representation types to models

    var RepTypeToModel = {
        "urn:org.restfulobjects:repr-types/homepage": spiroInternal.Home,
        "urn:org.restfulobjects:repr-types/object": spiroInternal.DomainObject,
        "urn:org.restfulobjects:repr-types/object-action": spiroInternal.ObjectAction,
        "urn:org.restfulobjects:repr-types/object-collection": spiroInternal.LinkList,
        "urn:org.restfulobjects:repr-types/action-result": spiroInternal.Invoke
    };

    var waitCount = 0;

    spiroInternal.cursorWait = function () {
        waitCount++;
        document.body.style.cursor = 'progress';
    };

    spiroInternal.cursorReset = function () {
        waitCount = 0;
        spiroInternal.cursorClear(); 
    };

    // Returns the cursor to the default pointer
    spiroInternal.cursorClear = function () {

        if (--waitCount <= 0) {
            document.body.style.cursor = 'auto';
        }
    };

    return spiroInternal;
} ());