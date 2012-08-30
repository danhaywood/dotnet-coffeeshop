/*! JsRender v1.0pre: http://github.com/BorisMoore/jsrender */
/*
* Optimized version of jQuery Templates, for rendering to string.
* Does not require jQuery, or HTML DOM
* Integrates with JsViews (http://github.com/BorisMoore/jsviews)
* Copyright 2011, Boris Moore
* Released under the MIT License.
*/

/// <reference path="jquery-1.7.1.js" />

window = window || global || {};
window.jsviews || window.jQuery && jQuery.views || (function (window, undefined) {
	var $, render, rTag, rTmplString, templates, tags, helpers, converters, extend, sub,
	FALSE = false, TRUE = true,
	jQuery = window.jQuery,

	rPath = /^(?:(true|false|null|\d[\d.]*)|([\w$]+|~|#(view|data|([\w$]+))?)([\w$.^]*)|((['"])(?:\\\1|.)*\7))$/g,
	//                   val                     object    viewDataCtx    viewProperty path    string, quot

	rParams = /(?:([([])\s*)?(?:([#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*!:?\/]|(=))\s*|([#~]?[\w$.^]+)([([])?)|(,\s*)|\\?(')|\\?(")|(?:\s*([)\]]))|(\s+)/g,
	//          leftParen            path          operator  err                                            eq         path2           paren  comma    apos   quot         rtPrn   space
	// (leftParen? followed by (path? followed by operator) or (path followed by paren?)) or comma or apos or quot or right paren or space

	rNewLine = /\r?\n/g,
	rUnescapeQuotes = /\\(['"])/g,
	rEscapeQuotes = /\\?(['"])/g,
	rBuildHash = /\x08(~)?([^\x08]+)\x08/g,
	autoName = 0,
	escapeMapForHtml = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	},
	tmplAttr = "data-jsv-tmpl",
	htmlSpecialChar = /[\x00"&'<>]/g,
	slice = Array.prototype.slice,

	// jsviews object ($.views if jQuery is loaded)
	jsv = {
		sub: sub = {}, // subscription, e.g. JsViews integration
		debugMode: TRUE,
		err: function (e) {
			return jsv.debugMode ? ("<br/><b>Error:</b> <em> " + (e.message || e) + ". </em>") : '""';
		},

		//===============
		// setDelimiters
		//===============

		setDelimiters: function (openTag, closeTag) {
			// Set or modify the delimiter characters for tags: "{{" and "}}"
			var firstCloseChar = closeTag.charAt(0),
				secondCloseChar = closeTag.charAt(1);

			openTag = "\\" + openTag.charAt(0) + "\\" + openTag.charAt(1); // Escape the characters - since they could be regex special characters
			closeTag = "\\" + firstCloseChar + "\\" + secondCloseChar;

			// Build regex with new delimiters
			//           {{
			rTag = openTag
			//          tag    (followed by / space or })      or  colon     or  html or code
				+ "(?:(?:(\\w+(?=[\\/\\s\\" + firstCloseChar + "]))\|(?:(\\w+)?(:)|(>)|(\\*)))"
			//     params
				+ "\\s*((?:[^\\" + firstCloseChar + "]|\\" + firstCloseChar + "(?!\\" + secondCloseChar + "))*?)"
			//  slash or closeBlock
				+ "(\\/)?|(?:\\/(\\w+)))"
			//  }}
			+ closeTag;

			// Default rTag:    tag             converter colon  html  code     params         slash   closeBlock
			//      /{{(?:(?:(\w+(?=[\/!\s\}!]))|(?:(\w+)?(:)|(>)|(\*)))((?:[^\}]|}(?!}))*?)(\/)?|(?:\/(\w+)))}}/g;
			rTag = new RegExp(rTag, "g");
			rTmplString = new RegExp("<.*>|" + openTag + ".*" + closeTag);
		},

		render: render = {},

		convert: function (converter, view, text) {
			var tmplConverters = view.tmpl.converters;
			return (tmplConverters && tmplConverters[converter] || converters[converter]).call(view, text);
		},

		ctx: function (view, helper) {
			var tmplHelpers = view.tmpl.helpers;
			helper = view.ctx[helper] || tmplHelpers && tmplHelpers[helper] || helpers[helper];
			return typeof helper === "function" ? helper.apply(view, slice.call(arguments, 2)) : helper;
		},

		//===============
		// templates
		//===============

		templates: templates = function (name, tmpl) {
			// Setter: Use $.view.tags( name, tagFn ) or $.view.tags({ name: tagFn, ... }) to add additional tags to the registered tags collection.
			// Getter: Use var tagFn = $.views.tags( name ) or $.views.tags[name] or $.views.tags.name to return the function for the registered tag.
			// Remove: Use $.view.tags( name, null ) to remove a registered tag from $.view.tags.

			// When registering for {{foo a b c==d e=f}}, tagFn should be a function with the signature: 
			// function(a,b). The 'this' pointer will be a hash with properties c and e.
			return store(templates, name, tmpl, compile);
		},

		//===============
		// tags
		//===============

		// Register declarative tags.
		tags: tags = function (name, tagFn) {
			// Setter: Use $.view.tags( name, tagFn ) or $.view.tags({ name: tagFn, ... }) to add additional tags to the registered tags collection.
			// Getter: Use var tagFn = $.views.tags( name ) or $.views.tags[name] or $.views.tags.name to return the function for the registered tag.
			// Remove: Use $.view.tags( name, null ) to remove a registered tag from $.view.tags.

			// When registering for {{foo a b c==d e=f}}, tagFn should be a function with the signature: 
			// function(a,b). The 'this' pointer will be a hash with properties c and e.
			return store(tags, name, tagFn);
		},

		//===============
		// helpers
		//===============

		// Register helper functions for use in markup.
		helpers: helpers = function (name, helperFn) {
			// Setter: Use $.view.helpers( name, helperFn ) or $.view.helpers({ name: helperFn, ... }) to add additional helpers to the registered helpers collection.
			// Getter: Use var helperFn = $.views.helpers( name ) or $.views.helpers[name] or $.views.helpers.name to return the function.
			// Remove: Use $.view.helpers( name, null ) to remove a registered helper function from $.view.helpers.
			// Within a template, access the helper using the syntax: {{... ~myHelper(...) ...}}.
			return store(helpers, name, helperFn);
		},

		//===============
		// converters
		//===============

		// Register converter functions for use in markup.
		converters: converters = function (name, converterFn) {
			// Setter: Use $.view.converters( name, converterFn ) or $.view.converters({ name: converterFn, ... }) to add additional converters to the registered converters collection.
			// Getter: Use var converterFn = $.views.converters( name ) or $.views.converters[name] or $.views.converters.name to return the converter function.
			// Remove: Use $.view.converters( name, null ) to remove a registered converter from $.view.converters.
			// Within a template, access the converter using the syntax: {{myConverter:...}}.
			return store(converters, name, converterFn);
		},

		//===============
		// tag
		//===============

		tag: function (tag, view, converter, content, tagProperties) {
			// This is a tag call, with arguments: "tag", view, converter, content, presenter [, params...]
			// Return the rendered tag
			var ret, ctx, name,
				tmpl = tagProperties.tmpl,
				tmplTags = view.tmpl.tags,
				nestedTemplates = view.tmpl.templates,
				args = arguments,
				presenters = jsv.presenters,
				hash = tagProperties._hash,
				tagFn = tmplTags && tmplTags[tag] || tags[tag];

			if (!tagFn) {
				return "";
			}

			content = content && view.tmpl.tmpls[content - 1];
			tmpl = tmpl || content || undefined;
			tagProperties.tmpl =
				"" + tmpl === tmpl // if a string 
					? nestedTemplates && nestedTemplates[tmpl] || templates[tmpl] || templates(tmpl)
					: tmpl;
			// Set the tmpl property to the content of the block tag, unless set as an override property on the tag

			if (presenters && presenters[tag]) {
				ctx = extend(extend({}, tagProperties.ctx), tagProperties);
				delete ctx.ctx;
				delete ctx._path;
				delete ctx.tmpl;
				tagProperties.ctx = ctx; // TODO verify whether this should be merged with view.ctx (or _view.ctx). How does it integrate with context() in JsViews?
				tagProperties._ctor = tag + (hash ? "=" + hash : "");

				tagProperties = extend(extend({}, tagFn), tagProperties);
				tagFn = tags["for"]; // Use for to render the layout template against the data
			}

			tagProperties._converter = converter;
			tagProperties._view = view;
			if (tagProperties._ctx) { //TODO This can be a reusable function
				tagProperties.ctx = $.extend({}, tagProperties._ctx);
			};
			if (view.ctx) {//TODO same reusable function above
				$.extend(tagProperties.ctx, view.ctx);
			};

			ret = tagFn.apply(tagProperties, args.length > 5 ? slice.call(args, 5) : [view.data]);
			return ret || (ret === undefined ? "" : ret.toString()); // (If ret is the value 0 or false or null, will render to string)
		}
	};

	converters.html = function (text) {
		// HTML encoding helper: Replace < > & and ' and " by corresponding entities.
		// inspired by Mike Samuel <msamuel@google.com>
		return text !== undefined ? String(text).replace(htmlSpecialChar, replacerForHtml) : "";
	};

	if (jQuery) {
		////////////////////////////////////////////////////////////////////////////////////////////////
		// jQuery is loaded, so make $ the jQuery object
		$ = jQuery;
		$.templates = templates;
		$.render = render;
		$.views = jsv;
		$.fn.render = function (data, context, parentView, path) {
			// Use first wrapped element as template markup.
			// Return string obtained by rendering the template against data.
			return renderTmpl(data, context, parentView, this[0], path);
		};

	} else {
		////////////////////////////////////////////////////////////////////////////////////////////////
		// jQuery is not loaded.

		$ = window.jsviews = jsv;
		$.extend = function (target, source) {
			var name;
			target = target || {};
			for (name in source) {
				target[name] = source[name];
			}
			return target;
		};

		$.isArray = Array && Array.isArray || function (obj) {
			return Object.prototype.toString.call(obj) === "[object Array]";
		};
	}

	extend = $.extend;

	//=================
	// View constructor
	//=================
	function View(context, path, parentView, data, template) {
		// Returns a view data structure for a new rendered instance of a template.
		// The content field is a hierarchical array of strings and nested views.

		parentView = parentView || { viewsCount: 0 };

		var parentContext = parentView.ctx;

		return {
			jsviews: "v1.0pre",
			path: path || "",
			// inherit context from parentView, merged with new context.
			index: parentView.viewsCount++,
			viewsCount: 0,
			tmpl: template,
			data: data || parentView.data || {},
			// Set additional context on this view (which will modify the context inherited from the parent, and be inherited by child views)
			// Note: If no jQuery, extend does not support chained copies - so limit extend() to two parameters
			ctx: context && context === parentContext
				? parentContext
				: (parentContext
			// if parentContext, maked copy
					? (parentContext = extend({}, parentContext), context
			// If context, merge context with copied parentContext
						? extend(parentContext, context)
						: parentContext)
			// if no parentContext, use context, or default to {}
					: context || {}),
			parent: parentView
		};
	}

	//===============
	// render
	//===============
	function nowrap(value) {
		return value;
	}

	function renderTmpl(data, context, parentView, tmpl, path, tagName) {
		// Render template against data as a tree of subviews (nested template), or as a string (top-level template).
		// tagName parameter for internal use only. Used for rendering templates registered as tags (which may have associated presenter objects)
		var noView, i, l, dataItem, arrayView, content, tmplFn,
			result = ""
		itemWrap = sub.itemWrap || nowrap;
		itemsWrap = sub.itemsWrap || nowrap;

		if (arguments.length === 2 && data.jsviews) {
			// data param is a view object
			parentView = data;
			context = parentView.ctx;
			data = parentView.data;
		}
		if (!tmpl.fn) {
			tmpl = templates[tmpl] || templates(tmpl);
		}
		if (tmpl) {
			noView = !(tmpl.useVw || parentView || context);
			if ($.isArray(data) && !tmpl.layout) {
				// Create a view item for the array, whose child views correspond to each data item.
				arrayView = noView || View(context, path, parentView, data);
				for (i = 0, l = data.length; i < l; i++) {
					dataItem = data[i];
					result += itemWrap(dataItem ? tmpl.fn(dataItem, noView || View(context, path, arrayView, dataItem, tmpl, this), jsv) : "");
				}
			} else {
				result += tmpl.fn(data, noView || View(context, path, parentView, data, tmpl), jsv);
			}
			return itemsWrap(result, path, tagName, tmpl);
		}
		return ""; // No tmpl. Could throw...
	}

	//===========================
	// build and compile template
	//===========================

	// Generate a reusable function that will serve to render a template against data
	// (Compile AST then build template function)

	function parsePath(all, val, object, viewDataCtxItemNo, viewProperty, path, string, quot) {
		// rPath:   val                     object    viewDataCtx    viewProperty path    string, quot
		// /^(true|false|null|\d[\d.]*)|([\w$]+|~|\*|#(view|data|ctx|([\w$]+))?)([\w$.[\]]*)|((['"])(?:\\\1|.)*\7)$/g
		return object
		? (viewDataCtxItemNo
			? (viewProperty
				? "view." + viewProperty
				: viewDataCtxItemNo) + (path || "")
			: object === "~"
				? 'c(view,"' + path + '"'
				: "data." + object + (path || "")
			)
		: string || (val || "");
	}

	function syntaxError() {
		throw "Syntax error";
	}

	//==== function compile ====
	function compile(name, tmpl, parent, allowCode) {
		allowCode = allowCode || tmpl.allowCode;

		var markup, newNode, options, elem, key, nested, nestedItem,
			loc = 0,
			stack = [],
			topNode = [],
			content = topNode,
			current = [, , topNode];

		//==== nested functions ====
		function markupOrSelector(value) {
			if ("" + value === value || value.nodeType) {
				try {
					if (jQuery) {
						// If selector is valid and returns at least one element, get first element
						elem = value.nodeType ? value : !rTmplString.test(value) && $(value)[0];
						if (elem) {
							// If a selector, create a name for data linking if none provided 
							value = templates[elem.getAttribute(tmplAttr)];
							if (!value) {
								// Not already compiled and cached, so compile and cache the name
								name = name || "_" + autoName++;
								elem.setAttribute(tmplAttr, name);
								value = compile(name, elem.innerHTML, undefined, allowCode);
								templates[name] = value;
							}
						}
					}
				} catch (e) { };
				return value;
			}
			// If value is not a string or dom element, return undefined
		}

		function pushPreceedingContent(shift) {
			shift -= loc;
			if (shift) {
				content.push(markup.substr(loc, shift).replace(rNewLine, "\\n"));
			}
		}

		function parseTag(all, tagName, converter, colon, html, code, params, slash, closeBlock, index) {
			//                  tag           converter colon  html  code     params         slash   closeBlock
			//      /{{(?:(?:(\w+(?=[\/!\s\}!]))|(?:(\w+)?(:)|(?:(>)|(\*)))((?:[^\}]|}(?!}))*?)(\/)?|(?:\/(\w+)))}}/g;

			// Build abstract syntax tree: [ tagName, converter, content, hash, params, contentMarkup ]
			if (html) {
				colon = ":";
				converter = "html";
			}
			var named,
				fnCall = {},
				hash = "",
				passedCtx = "",
				parenDepth = 0,
				quoted = FALSE, // boolean for string content in double quotes
				aposed = FALSE, // or in single quotes
				block = !slash && !colon; // Block tag if not self-closing and not {{:}} or {{>}} (special case)

			//==== nested helper function ====
			function parseParams(all, leftParen, path, operator, err, eq, path2, paren, comma, apos, quot, rightParen, space, index) {
				//rParams = /(?:([([])\s*)?(?:([#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*!:?\/]|(=))\s*|([#~]?[\w$.^]+)([([])?)|(,\s*)|\\?(')|\\?(")|(?:\s*([)\]]))|(\s+)/g,
				//              leftParen            path                      operator                                  eq          path2        paren  comma    apos   quot         rtPrn   space
				// (leftParen? followed by (path? followed by operator) or (path followed by paren?)) or comma or apos or quot or right paren or space

				if (leftParen) {
					parenDepth++;
				}
				path = path || path2;
				return (leftParen || "") + (aposed
				// within single-quoted string
					? (aposed = !apos, (aposed ? all : '"'))
					: quoted
				// within double-quoted string
						? (quoted = !quot, (quoted ? all : '"'))
						: space
							? (parenDepth
								? ""
								: named
									? (named = FALSE, "\b")
									: ","
							)
							: eq
				// named param
								? parenDepth ? syntaxError() : (named = TRUE, '\b' + path + ':')
								: err
									? syntaxError()
									: path
				// path
										? (path2 = path.replace(rPath, parsePath))
											+ ((path2.indexOf('c(view,"') === 0
												? paren ? "," : ")"
												: (paren || ""))
											+ (paren
												? (fnCall[++parenDepth] = TRUE, "")
												: (operator || "")
											))
										: operator
											? all
											: rightParen
				// function
												? (fnCall[parenDepth--] = FALSE, rightParen)
												: comma
													? (fnCall[parenDepth] ? "," : syntaxError())
													: (aposed = apos, quoted = quot, '"')
				);
			}
			//==== /end of nested function ====

			tagName = tagName || colon;
			pushPreceedingContent(index);
			loc = index + all.length; // location marker - parsed up to here
			if (code) {
				if (allowCode) {
					content.push(["*", params.replace(rUnescapeQuotes, "$1")]);
				}
			} else if (tagName) {
				if (tagName === "else") {
					current = stack.pop();
					content = current[2];
					block = TRUE;
				}
				params = (params
					? (params + " ")
						.replace(rParams, parseParams)
						.replace(rBuildHash, function (all, isCtx, keyValue, index) {
							if (isCtx) {
								passedCtx += keyValue + ",";
							} else {
								hash += keyValue + ",";
							}
							return "";
						})
					: "");
				params = params.slice(0, -1);
				newNode = [
					tagName,
					converter || "",
					block && [],
					"{" + hash + "_hash:'" + hash.slice(0, -1) + "',_path:'" + params + "'" + (passedCtx ? ",_ctx:{" + passedCtx.slice(0, -1) + "}" : "") + "}",
					params
				];

				if (block) {
					stack.push(current);
					current = newNode;
					current[5] = loc; // Store current location of open tag, to be able to add contentMarkup when we reach closing tag
				}
				content.push(newNode);
			} else if (closeBlock) {
				if (closeBlock !== current[0]) {
					//	throw "unmatched close tag: /" + closeBlock + ". Expected /" + current[ 0 ]; 
				}
				current[5] = markup.substring(current[5], index); // contentMarkup for block tag
				current = stack.pop();
			}
			if (!current) {
				throw "Expected block tag";
			}
			content = current[2];
		}
		//==== /end of nested functions ====

		//==== Compile the template ====
		markup = markupOrSelector(tmpl);
		if (!markup && tmpl.markup && (markup = markupOrSelector(tmpl.markup))) {
			// If tmpl is not a markup string or a selector string, then it must be a template object
			// Take its markup, and keep the other properties as options
			// If already compiled, clone the template object
			// otherwise, use the object as options
			options = tmpl.fn ? $.extend({}, tmpl) : tmpl;
			nested = options.templates;
			if (tmpl.debug && markup.fn) {
				// if we are setting debug = true on a script template, need to recompile
				markup = markup.markup;
			}
		}
		if (markup !== undefined) {
			if (name && !parent) {
				render[name] = function () {
					return tmpl.render.apply(tmpl, arguments);
				}
			}
			if (markup && markup.fn || tmpl.fn) {
				// tmpl is already compiled, so use it, or if name is provided, clone it
				if (markup.fn) {
					// if taken from script block selector, 
					if (name || tmpl.markup) {
						tmpl = extend(tmpl, markup);
						tmpl.name = name;
					} else {
						tmpl = markup;
					}
				}
			} else {
				// tmpl is a not yet compiled
				if (options || name) {
					options = options || {};
					options.name = name;
				}
				markup = markup.replace(rEscapeQuotes, "\\$1");
				markup.replace(rTag, parseTag);
				pushPreceedingContent(markup.length);
				tmpl = buildTmplFunction(topNode, markup, options, parent, 0, allowCode);
			}
			for (key in nested) {
				// compile nested template declarations
				nestedItem = nested[key];
				if (nestedItem.name !== key) {
					nested[key] = compile(key, nestedItem, tmpl);
				}
			}
			return tmpl;
		}
	}
	//==== /end of function compile ====

	// Build javascript compiled template function, from AST
	function buildTmplFunction(nodes, markup, options, parent, index, allowCode) {
		// nested helper function
		function extendStore(storeName) {
			if (parent[storeName]) {
				// Include parent items except if overridden by item of same name in options
				tmpl[storeName] = extend(extend({}, parent[storeName]), options[storeName]);
			}
		}

		options = options || {};

		var node, i, t, h, c, v, e, vw,
			l = nodes.length,
			code = (l ? "" : '"";'),
			nested = [],
			nestedIndex = 0,
			tmpl = {
				markup: markup,
				tmpls: nested,
				allowCode: allowCode,
				render: function (data, context, view) {
					return renderTmpl(data, context, view, this);
				}
			};

		if (parent) {
			if (parent.templates) {
				tmpl.templates = extend(extend({}, parent.templates), options.templates);
			}
			tmpl.parent = parent;
			tmpl.name = parent.name + "[" + index + "]";
			tmpl.index = index;
		}

		extend(tmpl, options);
		if (parent) {
			extendStore("templates");
			extendStore("tags");
			extendStore("helpers");
			extendStore("converters");
		}
		for (i = 0; i < l; i++) {
			node = nodes[i];
			if (node[0] === "*") {
				code = code.slice(0, i ? -1 : -3) + ";" + node[1] + (i + 1 < l ? "ret+=" : "");
			} else if ("" + node === node) { // type string
				code += '"' + node + '"+';
			} else {
				var tag = node[0],
					converter = node[1],
					content = node[2],
					hash = node[3],
					params = node[4];

				c = c || params.indexOf('c(view,"') > -1;
				vw = vw || params.indexOf("view") > -1;
				if (content) {
					nested.push(buildTmplFunction(content, node[5], undefined, tmpl, nestedIndex++, tmpl.allowCode));
				}
				code += (tag === ":"
					? (converter === "html"
						? (h = TRUE, "h(" + params)
						: converter
							? (e = TRUE, 'e("' + converter + '",view,' + params)
							: (v = TRUE, "((v=" + params + ')!==u?v:""')
					)
					: (t = TRUE, 't("' + tag + '",view,"' + (converter || "") + '",'
						+ (content ? nested.length : '""') // For block tags, pass in the key (nested.length) to the nested content template
						+ "," + hash + (params ? "," : "") + params))
						+ ")+";
			}
		}
		code = code.slice(0, -1);
		tmpl.fn = new Function("data, view, j, u", (tmpl.debug ? "debugger;" : "") + " var j=j||" + (jQuery ? "jQuery." : "js") + 'views,'
		// Include only the var references that are needed in the code
			+ (v ? "v," : "")
			+ (t ? "t=j.tag," : "")
			+ (e ? "e=j.convert," : "")
			+ (h ? "h=j.converters.html," : "")
			+ (c ? "c=j.ctx," : "")
			+ "ret; try{\n\n"
			+ (allowCode ? 'ret=' : 'return ')
			+ code + ";\n\n"
			+ (allowCode ? "return ret;" : "")
			+ "}catch(e){return j.err(e);}");
		tmpl.useVw = e || c || vw || t;
		return tmpl;
	}

	//========================== Private helper functions, used by code above ==========================

	function store(store, name, item, process) {
		var key;
		if (name && typeof name === "object" && !name.nodeType) {
			// If name is a map, iterate over map and call store for key
			for (key in name) {
				store(key, name[key]);
			}
			return jsv;
		}
		if (!name || item === undefined) {
			if (process) {
				item = process(undefined, item || name);
			}
		} else if ("" + name === name) { // name must be a string
			if (item === null) {
				// If item is null, delete this entry
				delete store[name];
			} else if (item = process ? process(name, item) : item) {
				store[name] = item;
			}
		}
		if (sub.store) {
			sub.store(store, name, item, process);
		}
		return item;
	}

	function replacerForHtml(ch) {
		// Original code from Mike Samuel <msamuel@google.com>
		return escapeMapForHtml[ch]
		// Intentional assignment that caches the result of encoding ch.
			|| (escapeMapForHtml[ch] = "&#" + ch.charCodeAt(0) + ";");
	}

	//========================== Register tags ==========================

	tags({
		"if": function () {
			var ifTag = this,
				view = ifTag._view;

			view.onElse = function (presenter, args) {
				var i = 0,
					l = args.length;

				while (l && !args[i++]) {
					// Only render content if args.length === 0 (i.e. this is an else with no condition) or if a condition argument is truey
					if (i === l) {
						return "";
					}
				}
				view.onElse = undefined; // If condition satisfied, so won't run 'else'.
				return renderTmpl(view.data, view.ctx, view, presenter.tmpl);
			};
			return view.onElse(this, arguments);
		},
		"else": function () {
			var view = this._view;
			return view.onElse ? view.onElse(this, arguments) : "";
		},
		"for": function () {
			var i,
				self = this,
				result = "",
				args = arguments,
				l = args.length,
				content = self.tmpl,
				view = self._view;

			for (i = 0; i < l; i++) {
				result += args[i] ? renderTmpl(args[i], self.ctx, view, content, self._path, self._ctor) : "";
			}
			return l
				? result
			// If no data parameter, use the current data from view, and render once
				: result + renderTmpl(view.data, view.ctx, view, content, self._path, self.tag);
		},
		"=": function (value) {
			return value;
		},
		"*": function (value) {
			return value;
		}
	})

	//========================== Register global helpers ==========================

	//	.helpers({ // Global helper functions
	//		// TODO add any useful built-in helper functions
	//	})

	//========================== Register converters ==========================

	//	.converters({
	//		// TODO add any useful built-in converter functions
	//	})

	//========================== Define default delimiters ==========================
	.setDelimiters("{{", "}}");

})(window);
