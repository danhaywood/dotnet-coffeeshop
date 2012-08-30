$(function () {

    $.views.converters({
        toArray: function (value) {
            return _.toArray(value);
        }
    });

    $.views.converters({
        shortName: function (value) {
            return value.substring(value.lastIndexOf(".") + 1, value.length);
        }
    });

    $.views.converters({
        formattedDateTime: function (value) {

            var pad = function (toPad) {
                var s = toPad.toString();

                if (s.length == 1) {
                    return "0" + toPad;
                }
                return toPad;
            };

            if (value === null) {
                return "";
            }

            var date = new Date(value);

            return $.datepicker.formatDate('dd/mm/yy', date) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
        }
    });

    $.views.converters({
        formattedScalar: function (value) {
            if (value === null) {
                return "";
            }

            return value; 
        }
    });




    $.views.helpers({
        // To render all fields within a template with {{for ~getFields(object)}}
        getFields: function (object) {
            var key, value,
                fieldsArray = [];
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];
                    // For each property/field add an object to the array, with key and value
                    fieldsArray.push({
                        key: key,
                        value: value
                    });
                }
            }
            return fieldsArray;
        }
    });

    $.views.helpers({
        // To render all properties within a template with {{for ~getProperties(object)}}
        getProperties: function (object) {
            var key, value,
                fieldsArray = [];
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];

                    if (value.memberType === "property" || value.memberType === "collection") {

                        // For each property/field add an object to the array, with key and value
                        fieldsArray.push({
                            key: key,
                            value: value
                        });
                    }
                }
            }
            return fieldsArray;
        }
    });

    $.views.helpers({
        // To render all actions within a template with {{for ~getActions(object)}}
        getActions: function (object) {
            var key, value,
                fieldsArray = [];
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];

                    if (value.memberType === "action") {

                        // For each property/field add an object to the array, with key and value
                        fieldsArray.push({
                            key: key,
                            value: value
                        });
                    }
                }
            }
            return fieldsArray;
        }
    });

    $.views.helpers({
        // To render all Find actions within a template with {{for ~getFindActions(object)}}
        getFindActions: function (object, returnType) {
            var key, value,
                fieldsArray = [];
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];

                    if (value.extensions.returnType === returnType) {

                        // For each property/field add an object to the array, with key and value
                        fieldsArray.push({
                            key: key,
                            value: value
                        });
                    }
                }
            }
            return fieldsArray;
        }
    });

    $.views.helpers({
        isFindAction: function (object, returnType) {
            if (object.extensions.returnType === returnType || object.extensions.elementType === returnType) {

                if (object.extensions.hasParams) {

                    return _.all(object.parameters, function (i) {

                        return i.extensions.returnType === "integer" ||
                            i.extensions.returnType === "string" ||
                                i.extensions.returnType === "number" ||
                                    i.extensions.returnType === "boolean";
                    });
                }

                return true;
            }
            return false;
        }
    });

    $.views.helpers({
        hasFinder: function (object) {
            return !object.disabledReason;
        }
    });



    $.views.helpers({
        isScalar: function (typeString) {
            return (typeString === "integer" || typeString === "number" || typeString === "string" || typeString === "boolean");
        }
    });

    $.views.helpers({
        isCollection: function (typeString) {
            return (typeString === "list");
        }
    });

    $.views.helpers({
        isReference: function (typeString) {
            return !$.views.helpers.isScalar(typeString) && !$.views.helpers.isCollection(typeString);
        }
    });
});