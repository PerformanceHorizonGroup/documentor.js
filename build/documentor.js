/*!
 * Documentor.js
 * Copyright(c) 2012-2013 Georgi Kostov <p_e_a@gbg.bg>, http://performancehorizon.com
 * https://github.com/PerformanceHorizonGroup/documentor.js
 * MIT Licensed
 */
(function (){

	Function.prototype.scope=function (scopeObj){
		var f=this;	
		return function (){
			return f.apply(scopeObj, arguments);
		};
	};
	Function.prototype.createCallback=function (scopeObj, params, appendArgs){
		var f=this;	
		return function (){
			var args=params||arguments;
			if(appendArgs === true)
				args=[].slice.call(arguments, 0).concat(args);
			return f.apply(scopeObj||this, args);
		};
	};

	var ns = (typeof module == 'object' && module.exports) || (window.util = {});
	
	if(typeof module == 'object' && module.exports){
		ns.extend=require('../lib/other/jquery.extend');
//		ns.isArray = Array.isArray || require('util').isArray;
		ns.noop=function (){};
		ns.inherits=require('util').inherits;
		
		// copied from jQuery source
		ns.inArray = function( elem, array, i ) {
			var len;
	
			if ( array ) {
				if ( Array.prototype.indexOf ) {
					return Array.prototype.indexOf.call( array, elem, i );
				}
	
				len = array.length;
				i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
	
				for ( ; i < len; i++ ) {
					// Skip accessing in sparse arrays
					if ( i in array && array[ i ] === elem ) {
						return i;
					}
				}
			}
	
			return -1;
		};
	}else{
		ns.extend=$.extend;
		ns.noop=$.noop;
		ns.inArray=$.inArray;
		
		// copied from node.js source
		ns.inherits=function (ctor, superCtor){
		    ctor.super_ = superCtor;
		    ctor.prototype = Object.create(superCtor.prototype, {
		        constructor: {
		            value: ctor,
		            enumerable: false
		        }
		    });
		};
		
	}

	/**
	 * Ensure namspace exists
	 * @param	{String}	namespace
	 * @param	{Object}	rootNS	(optional)	This is optional only in the browser and defaults to window .
	 * @return	{Object}	NS	The namespace object or null if invalid rootNS was given and the NS could not be found/created
	 */
	ns.ns=function (namespace, rootNS){
		if(typeof namespace == 'string')
			namespace=namespace.split('.');
		if(!rootNS){ // optional only in the browser!!! in node.js rootNS *must* be specified
			if(arguments.length<2){ // if no root NS was specified
				rootNS=window[namespace[0]];
				if(rootNS)
					namespace.shift();
				else
					rootNS=window;
			}else
				return null;
		}
		var res=ns.getPropValue(rootNS, namespace);
		if(!res){
			res={};
			ns.setPropValue(rootNS, namespace, res);
		}
		return res;
	};
	/**
	 * If the property does not exist it is assigned defaultVal if that is specified else - undefined. 
	 * @param	{Object}	obj
	 * @param	{Array/String}	prop An array with the property path or a dot-delimited String giving the path 
	 * @param	{Mixed}	defaultVal	(optional) The value to return if the property does not exist.
	 * @param	{Array}	alternateProp	(optional)	An optional property to return. If that property does not exist too defaultVal will be returned (so it must be passed too)
	 * @return	{Mixed}	res
	 */
	ns.getPropValue=function (obj, prop, defaultVal, alternateProp){
		var res=obj;
		if(typeof prop == 'string')
			prop=prop.split('.');
		else
			prop=prop.slice(0);
		while(prop.length){
			var p=prop.shift();
			if(!(p in res)){
				if(arguments.length>3) // if a alternateProp is given
					return ns.getPropValue(obj, alternateProp, defaultVal);
				else if(arguments.length>2) // if a defaultVal is given
					res[p] = defaultVal;
				else
					return undefined;
			}
			res=res[p];
		}
		return res;
	};
	/**
	 * @param	{Object}	obj
	 * @param	{Array/String}	prop An array with the property path or a dot-delimited String giving the path 
	 * @param	{Mixed}	val	The value to set.
	 */
	ns.setPropValue=function (obj, prop, val){
		if(typeof prop == 'string')
			prop=prop.split('.');
		else
			prop=prop.slice(0);
		if(prop.length>1){
			var p=prop.pop();
			obj=ns.getPropValue(obj, prop, {});
			prop=[p];
		}
		obj[prop[0]]=val;
	};
	
}());// if registerModule is defined then we must be in the browser so call that. if not then this has
// been loaded as a node.js module and the code can execute right away.
(typeof registerModule=='function' ? registerModule : function (fn, module){fn(module);}).call(this, function (module){
	var exports=module.exports,
		require=module.require;
		
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var isArray = Array.isArray;

function EventEmitter(cfg){
	if(cfg && typeof cfg=='object'){
		if('listeners' in cfg){
			for(var l in cfg.listeners)
				this.on(l, cfg.listeners[l]);
			delete cfg.listeners;
		}
		for(var p in cfg)
			this[p]=cfg[p];
	}
}
exports.EventEmitter = EventEmitter;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._maxListeners = n;
};


EventEmitter.prototype.emit = function() {
  var type = arguments[0];
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var l = arguments.length;
        var args = new Array(l - 1);
        for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var l = arguments.length;
    var args = new Array(l - 1);
    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // If we've already got an array, just append.
    this._events[type].push(listener);

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._maxListeners !== undefined) {
        m = this._maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('.once only takes instances of Function');
  }

  var self = this;
  function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  };

  g.listener = listener;
  self.on(type, g);

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var position = -1;
    for (var i = 0, length = list.length; i < length; i++) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener))
      {
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    list.splice(position, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (list === listener ||
             (list.listener && list.listener === listener))
  {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

}, (function (){ return typeof module=='object'?module:{exports:this};}).call(null));

(function (){
	var Documentor,
		util,
		emitter,
		isNode=typeof module == 'object' && module.exports;
	
	if(isNode){
		util=require('../lib/util');
		Documentor=module.exports;
		emitter=require('../lib/events').EventEmitter;
	}else{
		util=window.util;
		Documentor=util.ns('Documentor');
		emitter=window.EventEmitter;
	}
	
	/**
	 * @class	Documentor.Api
	 * Excapsulates all data, configuration and methods of the target API's documentation.
	 * @extends	EventEmitter
	 * @constructor
	 */
	 
	Documentor.Api=function (cfg){
		Documentor.Api.super_.apply(this, arguments);
		this.initialize();
	};
	util.inherits(Documentor.Api, emitter);
	
	util.extend(Documentor.Api.prototype, {
		/**
		 * @cfg	{String}	NSPathSeparator
		 * Defaults to the dot character (".") .
		 */
		NSPathSeparator:'.',
		initialize:function (){
			/**
			 * @cfg	{Object}	ns
			 * Namespace defaults.
			 */
			/**
			 * @property	{Object}	ns
			 * This object has the complete API description. It has very little upon creation but the SourceProcessor object's job is to fill it with details.
			 */
			if('ns' in this){
				this.nsDefaults=this.ns;
				delete this.ns;
			}
			
			this.reset();
			/**
			 * @cfg	{Documentor.SourceLoader}	sourceLoader	(required)
			 * The loader to use.
			 */
//			if(this.renderer)
//				this.bind('sourceProcessed', function (){
//					if(this.sourceFiles.length==0)
//						this.renderer.render(this);
//				});
			
			/**
			 * @cfg	{Documentor.SourceProcessor}	sourceProcessor
			 * The source processor to use. 
			 */
			
			/**
			 * @cfg	{Array}	sourceFiles
			 * If the list is provided it will be processed on initialization.
			 */
			if(this.sourceFiles)
				this.processSourceFiles(this.sourceFiles);
		},
		/**
		 * @method	reset
		 * Reset the ns object to its initial state. This is useful before rebuilding it from new sources. 
		 */
		reset:function (){
			var defNS={
				name:'API',
				type:'api',
				children:{}
			};
			this.ns=util.extend(true, {}, defNS, this.nsDefaults);
		},
		/**
		 * @method	processSourceFiles
		 * @param	{Array}	sourceFiles	A list of file to process.
		 */
		processSourceFiles:function (sourceFiles){
			var fileLoadedCb=function (fileData, fileURL){
					this.sourceProcessor.process(fileData, this, fileURL);
				}.scope(this);
			for(var i=0; i<sourceFiles.length; i++){
				this.sourceLoader.getSourceFile(sourceFiles[i], fileLoadedCb);
			}
		},
		sourceFileEnd:function (fileURL){
	        /**
	         * @event sourceProcessed
	         * Fires when a source file has been processed.
	         * @param {Documentor.Api} this
	         * @param {String}	fileURL
	         */
			this.emit('sourceProcessed', this, fileURL);
			if(this.sourceLoader.queue.length==0){
		        /**
		         * @event sourceQueueEmpty
		         * Fires when the source files queue of the loader is emptied - all given source files are loaded.
		         * @param {Documentor.Api} this
		         */
				this.emit('sourceQueueEmpty', this);
				
				/**
				 * @cfg	{Documentor.render.DocumentationRenderer}	renderer
				 * If provided will call its render() method after the last source file is processed.
				 */
				if(this.renderer)
					this.renderer.render(this);
			}
		},
		/**
		 * @method	getNSObject
		 * Returns the namespace object on the given path.
		 * @param	{String} path
		 * @param	{Boolean} autoCreate (optional) Set to true to have a "namespace" object created if nothing exists for that path.
		 * @return	{Object}	The object on that path.
		 */
		getNSObject:function (path, autoCreate){
			var obj=null,
				pathNames = typeof path=='string'?path.split(this.NSPathSeparator):path;
			if(typeof path=='string')
				pathNames=path.split(this.NSPathSeparator);
			else{
				pathNames=path;
				path=path.join(this.NSPathSeparator);
			}
			if(pathNames.length){
				obj=this.ns;
				var currentPath=[];
				if(pathNames[0]==this.ns.name)
					pathNames.shift();
				while(pathNames.length){
					var p=pathNames.shift();
					currentPath.push(p);
					if(!(p in obj.children)){
						if(autoCreate)
							obj.children[p]={
								type:'namespace',
								name:currentPath.join(this.NSPathSeparator),
								children:{},
								methods:{},
								description:''
							};
						else
							return null;
					}
					obj=obj.children[p];
				}
			}
			return obj;
		}
	});
	
}());

(function (){
	
	var util, Documentor;
	if(typeof module == 'object' && module.exports){
		util=require('../lib/util');
		Documentor=module.exports;
	}else{
		util=window.util;
		Documentor=util.ns('Documentor');
	}

	/**
	 * @class Documentor.SourceLoader
	 * @constructor
	 * Base class for a source file loader.
	 */
	Documentor.SourceLoader=function (cfg){
		this.initialize();
	};
	util.extend(Documentor.SourceLoader.prototype, {
		initialize:function (){
			/**
			 * @property	{Array} queue	A list of source files queued for loading.
			 */
			this.queue=[];
		},
		/**
		 * @method	getSourceFile
		 * Returns file contents asynchronously if a callback is specified and may return immediately if there is no callback and the content can be retrieved synchronously.
		 * @param	{String}	fileURL	Source file locator.
		 * @param	{Function}	cb	(optional)	A callback to send file contents to when available. Two parameters are passed : {String} fileData and {String} fileURL .
		 * @return	{String}	fileData	File contents or null if the cb parameter was given.
		 */
	});

	/**
	 * @class Documentor.AjaxSourceLoader
	 * @extends Documentor.SourceLoader
	 * @constructor
	 * Source file loader using AJAX to get file contents.
	 */
	Documentor.AjaxSourceLoader=function (cfg){
		Documentor.AjaxSourceLoader.super_.apply(this, arguments);
	};
	util.inherits(Documentor.AjaxSourceLoader, Documentor.SourceLoader);
	util.extend(Documentor.AjaxSourceLoader.prototype, {
//		initialize:function (){
//		},
		getSourceFile:function (fileURL, cb){
			if(cb){
				this.queue.push(fileURL);
				jQuery.ajax({
					url:fileURL,
					dataType:'text',
					success:function (data, textStatus, jqXHR){
						var queueInd=util.inArray(fileURL, this.queue);
						if(queueInd>-1)
							this.queue.splice(queueInd, 1);
						cb(data, fileURL);
					}.scope(this)
				});
			}
			return null;
		}
	});
	
	/**
	 * @class Documentor.FileSourceLoader
	 * Loads the source from a file.
	 * @extends Documentor.SourceLoader
	 * @constructor
	 */
	Documentor.FileSourceLoader=function (cfg){
		Documentor.FileSourceLoader.super_.apply(this, arguments);
	};
	/**
	 * @method listFiles
	 * @static
	 * Find all files matched by the pattern which may include the * and ? wildcards. The search is performed synchronously.
	 * @param	{String}	pattern	The string to match file names for.
	 * @return	{Array}	A list of files matched for the pattern.
	 */
	Documentor.FileSourceLoader.listFiles=function (pattern){
		var list=[],
			path=require('path'),
			fs=require('fs');
		pattern=path.resolve(pattern); // get the absolute path

		var i=pattern.indexOf('*');
		if(i>-1 || (i=pattern.indexOf('?'))>-1){
			var dir=path.dirname(pattern.substr(0, i)),
				matcher=new RegExp('^'+pattern.replace(/\\/g, '\\\\').replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')+'$');
			function listFilesInDir(dir){
//				var list=[],
				var files=fs.readdirSync(dir);
				for(var i=0; i<files.length; i++){
					files[i]=path.join(dir, files[i]);
					var stats=fs.lstatSync(files[i]);
					if(stats.isDirectory())
						listFilesInDir(files[i]); //list=list.concat(listFilesInDir(files[i]));
					else if(stats.isFile() && matcher.test(files[i]))
						list.push(files[i]);
				}
//				return list;
			}
			listFilesInDir(dir);
//			list=listFilesInDir(dir);
		}else{ // if there are no wildcards in the pattern
			if(fs.existsSync(pattern))
				list.push(pattern);
		}
		
		return list;
	};
	util.inherits(Documentor.FileSourceLoader, Documentor.SourceLoader);
	util.extend(Documentor.FileSourceLoader.prototype, {
		getSourceFile:function (fileName, cb){
			var fs=require('fs'),
				fn=require('path').resolve(fileName);
			if(cb){
				this.queue.push(fileName);
				fs.readFile(fn, 'utf8', function (err, data){
					var queueInd=util.inArray(fileName, this.queue);
					if(queueInd>-1)
						this.queue.splice(queueInd, 1);
					cb(err?null:data, fileName);
				}.scope(this));
			}else
				return fs.readFileSync(fn, 'utf8');
		}
	});
	
}());

(function (){
	
	var util, Documentor;
	if(typeof module == 'object' && module.exports){
		util=require('../lib/util');
		Documentor=module.exports;
	}else{
		util=window.util;
		Documentor=util.ns('Documentor');
	}

	/**
	 * @class Documentor.SourceProcessor
	 * @constructor
	 * Base class for a source file prcessor.
	 */
	Documentor.SourceProcessor=function (cfg){
		util.extend(this, cfg);
		this.initialize();
	};
	util.extend(Documentor.SourceProcessor.prototype, {
		initialize:util.noop
		/**
		 * @method	process
		 * Parses the source code and updates the specified API object. 
		 * @param	{String}	fileData	Source file contents.
		 * @param	{Documentor.Api}	api	The API object to amend.
		 */
	});

}());

(function (){
	
	var ns,
		util;
	
	if(typeof module == 'object' && module.exports){
		util=require('../../lib/util');
		ns=module.exports;
	}else{
		util=window.util;
		ns=util.ns('Documentor.render');
	}
	
	/**
	 * @class Documentor.render.DocumentationRenderer
	 * @constructor
	 * Base class for a documentation renderer.
	 */
	ns.DocumentationRenderer=function (cfg){
		util.extend(this, cfg);
		this.initialize();
	};
	util.extend(ns.DocumentationRenderer.prototype, {
		initialize:util.noop
	});
	/**
	 * @method render
	 * Renders the documentation from the given API object
	 * @param	{Documentor.Api}	api	The API object to render.
	 */

}());

(function (){
	
	var util, Documentor, SourceProcessor;
	if(typeof module == 'object' && module.exports){
		util=require('../../lib/util');
		SourceProcessor=require('../SourceProcessor').SourceProcessor;
		Documentor=module.exports;
	}else{
		util=window.util;
		Documentor=util.ns('Documentor');
		SourceProcessor=Documentor.SourceProcessor;
	}

	/**
	 * @class Documentor.PHGSourceProcessor
	 * @extends Documentor.SourceProcessor
	 * @constructor
	 * Source file processor for JS source code from PHG. It extracts and processes javaDoc style comments in source.
	 * The set of tags it recognizes is mostly borrowed from ExtJS.
	 */
	Documentor.PHGSourceProcessor=function (cfg){
		Documentor.PHGSourceProcessor.super_.apply(this, arguments);
	};

	util.inherits(Documentor.PHGSourceProcessor, SourceProcessor);

	var tagMatcher=new RegExp('^\\s*@([A-Za-z]+)(\\s+|$)');
	var commentLineStartMatcher=/^\s*\*/,
		simpleTagParamMatcher=/^\S*/,
		paramTagParametersMatcher=/^\{(\S*)\}\s(\S*)(\s\(optional\))?/,
		returnTagMatcher=/^\{(\S*)\}/;
	
	/**
	 * TO-DO: integrate unit testing
	 * TO-DO: implement @hide, @mixin, etc.
	 * TO-DO: implement tags to include contents from external files (eventually markdown, etc.)
	 */
	 
	util.extend(Documentor.PHGSourceProcessor.prototype, {
		/**
		 * @property	{Object}	docTagProcessors
		 * A hash keyed by the tag names that this object can process. At each key there's a parser function which will be given a line to process. 
		 */
		docTagProcessors:{
			// these are called with scope set to the PHGSourceProcessor object
			'namespace':function (line){
				// start a new namespace definition
				// the text after @namespace is taken as the name of the namespace and the rest of the line is a short summary of the namespace
				var match=line.match(simpleTagParamMatcher),
					name=match[0];
				var namePath = name.split('.'),
					nsObject=this.processingDataStorage.api.getNSObject(namePath, true);
				this.processingDataStorage.currentClassObj=null;
				this.processingDataStorage.currentNamespaceObj=nsObject;
				this.processingDataStorage.currentDescribableObj=nsObject;
			},
			'class':function (line){
				// start a new class definition
				// the text after @class is taken as the name of the class and the rest of the line is a short summary of the class
				var match=line.match(simpleTagParamMatcher),
					name=match[0];
				if(this.processingDataStorage.currentModuleObj)
					name=this.processingDataStorage.currentModuleObj.name+'.'+name;
				var classNamePath = name.split('.'),
					className=classNamePath.pop(),
					nsObject=this.processingDataStorage.api.getNSObject(classNamePath, true),
					classObj=nsObject.children[className];
				if(!classObj){
					classObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						config:{},
						properties:{},
						methods:{},
						events:{},
						definedIn:this.processingDataStorage.fileURL,
						flags:{}
					};
					nsObject.children[className]=classObj;
				}
				util.extend(classObj, {
					type:'class',
					name:name
				});
				this.processingDataStorage.currentClassObj=classObj;
				this.processingDataStorage.currentDescribableObj=classObj;
			},
			'module':function (line){
				// start a new module definition
				// the text after @module is taken as the name of the module and the rest of the line is a short summary of the module
				var match=line.match(simpleTagParamMatcher),
					name=match[0]||this.processingDataStorage.fileURL.split('/').pop().replace(/\.js$/, ''),
					nsObject=this.processingDataStorage.api.ns,
					moduleObj=nsObject.children[name];
				if(!moduleObj){
					moduleObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						children:[],
						config:{},
						properties:{},
						methods:{},
						events:{},
						definedIn:this.processingDataStorage.fileURL
					};
					nsObject.children[name]=moduleObj;
				}
				util.extend(moduleObj, {
					type:'module',
					name:name
				});
				this.processingDataStorage.currentClassObj=null;
				this.processingDataStorage.currentModuleObj=moduleObj;
				this.processingDataStorage.currentDescribableObj=moduleObj;
			},
			'moduleFunction':function (line){
				if(!this.processingDataStorage.currentModuleObj){
					console.warn('@method tag must appear *after* @module !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
					return;
				}
				// method definition
				// the text after @method is taken as the name of the method and the rest of the line is a short summary of the method
				var match=line.match(simpleTagParamMatcher),
					name=match[0],
					methodObj=this.processingDataStorage.currentModuleObj.methods[name];
				if(!methodObj){
					methodObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						params:[],
						returns:{
							type:'void',
							summary:''
						},
						flags:{}
					};
					this.processingDataStorage.currentModuleObj.methods[name]=methodObj;
				}
				this.processingDataStorage.currentParamOwnerObj=methodObj;
				this.processingDataStorage.currentMethodObj=methodObj;
				this.processingDataStorage.currentDescribableObj=methodObj;
			},
			'cfg':function (line){
				// configuration option
				// the text after @cfg should be like: {DataType} configName Summary text for the option
				// configuration options are (optional) by default. add (required) to change that.
				var match=line.match(paramTagParametersMatcher),
					dataType=match[1],
					name=match[2],
					cfgObj=this.processingDataStorage.currentClassObj.config[name];
				if(!cfgObj){
					cfgObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						dataType:dataType
					};
					this.processingDataStorage.currentClassObj.config[name]=cfgObj;
				}
				this.processingDataStorage.currentDescribableObj=cfgObj;
			},
			'property':function (line){
				// property
				// the text after @property should be like: {DataType} propertyName Summary text for the property
				var match=line.match(paramTagParametersMatcher),
					dataType=match[1],
					name=match[2],
					propObj=this.processingDataStorage.currentClassObj.properties[name];
				if(!propObj){
					propObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						dataType:dataType
					};
					this.processingDataStorage.currentClassObj.properties[name]=propObj;
				}
				this.processingDataStorage.currentDescribableObj=propObj;
			},
			'method':function (line){
				var currentNSObject=this.processingDataStorage.currentClassObj||this.processingDataStorage.currentNamespaceObj;
				if(!currentNSObject){
					console.warn('@method tag must appear *after* @class or @namespace !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
					return;
				}
				// method definition
				// the text after @method is taken as the name of the method and the rest of the line is a short summary of the method
				var match=line.match(simpleTagParamMatcher),
					name=match[0],
					methodObj=currentNSObject.methods[name];
				if(!methodObj){
					methodObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						params:[],
						returns:{
							type:'void',
							summary:''
						},
						flags:{}
					};
					currentNSObject.methods[name]=methodObj;
				}
				this.processingDataStorage.currentParamOwnerObj=methodObj;
				this.processingDataStorage.currentMethodObj=methodObj;
				this.processingDataStorage.currentDescribableObj=methodObj;
			},
			'event':function (line){
				if(!this.processingDataStorage.currentClassObj){
					console.warn('@event tag must appear *after* @class !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
					return;
				}
				// event definition
				// the text after @event is taken as the name of the event and the rest of the line is a short summary of the event
				var match=line.match(simpleTagParamMatcher),
					name=match[0],
					eventObj=this.processingDataStorage.currentClassObj.events[name];
				if(!eventObj){
					eventObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						params:[]
					};
					this.processingDataStorage.currentClassObj.events[name]=eventObj;
				}
				this.processingDataStorage.currentParamOwnerObj=eventObj;
				this.processingDataStorage.currentDescribableObj=eventObj;
			},
			'param':function (line){
				// param definition
				// the text after @param should be like: {DataType} paramName Summary text for the parameter
				// params are (required) by default. add (optional) to change that.
				var match=line.match(paramTagParametersMatcher),
					paramObj={
						description:line.substring(match[0].length).replace(/^\s+/,''), // add +1 to skip the space following
//						summary:line.substring(match[0].length).replace(/^\s+/,''), // add +1 to skip the space following
						name:match[2],
						optional:!!match[3],
						dataType:match[1]
					};
				if(this.processingDataStorage.currentParamOwnerObj)
					this.processingDataStorage.currentParamOwnerObj.params.push(paramObj);
				else
					console.warn('@param tag must appear *after* @method or @event !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
				this.processingDataStorage.currentDescribableObj=paramObj;
			},
			'extends':function (line){
				// the text after @extends is taken as the name of the base class
				/**
				 * TO-DO: may add a check if a @class is currently being processed
				 */
				this.processingDataStorage.currentClassObj['extends'] = line.match(simpleTagParamMatcher)[0];		
			},
			'singleton':function (line){
				// the text after @extends is taken as the name of the base class
				/**
				 * TO-DO: may add a check if a @class is currently being processed
				 */
				this.processingDataStorage.currentClassObj.flags['singleton'] = true;		
			},
			'return':function (line){
				// the text after @return should be like: {DataType} Summary text for the returned value
				var match=line.match(returnTagMatcher);
				if(this.processingDataStorage.currentMethodObj){
					this.processingDataStorage.currentMethodObj.returns.type = match[1];		
					this.processingDataStorage.currentMethodObj.returns.summary = line.substring(match[0].length).replace(/^\s+/,'');		
				}else
					console.warn('@return tag must appear *after* @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			},
			'private':function (line){
				if(this.processingDataStorage.currentMethodObj)
					this.processingDataStorage.currentMethodObj.flags['private'] = true;		
				else
					console.warn('@private tag must appear *after* @class or @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			},
			'static':function (line){
				if(this.processingDataStorage.currentMethodObj){
					this.processingDataStorage.currentMethodObj.flags['static'] = true;		
				}else
					console.warn('@static tag must appear *after* @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			},
			'template':function (line){
				if(this.processingDataStorage.currentMethodObj){
					this.processingDataStorage.currentMethodObj.flags['template'] = true;		
				}else
					console.warn('@template tag must appear *after* @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			}
		},
		processNextComment:function (commentContent){
			// process comment content line-by-line

			// usually lines start with * characters, remove them 
			for(var i=0; i<commentContent.length; i++)
				commentContent[i]=commentContent[i].replace(commentLineStartMatcher, '');
			this.processingDataStorage.currentMethodObj=null; // method attributes must be within the same comment as the method declaration
			this.processingDataStorage.currentParamOwnerObj=null;
			this.processingDataStorage.currentDescribableObj=null; // the description must be within the same comment as the object
			var descriptionTxt=null,
				checkDescriptionText=function (){
					if(descriptionTxt!==null){  // if we've been collecting a description text till now
						if(this.processingDataStorage.currentDescribableObj!=null)  // if there is an object to apply the description to
							this.processingDataStorage.currentDescribableObj.description+=descriptionTxt.replace(/^\s+/,'');
						descriptionTxt=null;
					}
				}.scope(this);
			this.processingDataStorage.currentLine-=commentContent.length;
			for(var i=0; i<commentContent.length; i++){
				++this.processingDataStorage.currentLine;
				var line=commentContent[i]; //.replace(commentLineStartMatcher, '');
				var tagMatch=line.match(tagMatcher);
				if(tagMatch){
					checkDescriptionText();
					line=line.substring(tagMatch[0].length); // remove the matched tag part of the line
					// process doc tag
					if(tagMatch[1] in this.docTagProcessors){
						try{
							this.docTagProcessors[tagMatch[1]].call(this, line);
						}catch(e){
							console.error('Esception occured while processing @'+tagMatch[1]+' ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
						}
					}else
						console.warn('unknown tag @'+tagMatch[1]);
				}else if(line.length){
					if(descriptionTxt===null)
						descriptionTxt=line;
					else
						descriptionTxt+=line;
				}
			}
			checkDescriptionText();
		},
		// override
		process:function (fileData, api, fileURL){
//			console.log('file:'+fileURL)
//			console.log('data:'+fileData)
			var ind=-1,
				lines=fileData.split('\n'),
				processingComment=0, // 0 - not processing; 1 - processing /** */ type of comment; 2 - processing /* */ type of comment
				commentContent=[];
			this.processingDataStorage={
				fileURL:fileURL,
				currentLine:-1,
				api:api,
				currentClassObj:null, // the last processed class object
				currentNamespaceObj:null, // the last processed namespace object
				currentModuleObj:null, // the last processed module object
				currentMethodObj:null, // the last processed method object
				currentDescribableObj:null, // the last processed class or method object. this reference is used when a description text is found.
				currentParamOwnerObj:null // the last processed method or event object. this reference is used when a parameter needs to be processed.
			};
			/**
			 * TO DO: check for multi-line strings which although against the JS standards may still be used by someone
			 */
			function cleanup(line){ // return line;
				// remove string literals, regexes and SL comments untill a comment start is found.
				var indexes=['\'', '\"', '/'],
					result=line;
				for(var i=0; i<indexes.length; ++i){
					var ind=line.indexOf(indexes[i]);
					if(ind<0)
						indexes.splice(i--, 1);
					else
						indexes[i]=[indexes[i], ind];
				}
				if(indexes.length){
					indexes.sort(function (a, b){ return a[1]-b[1]})
					var quoteChar=indexes[0][0],
						closingQuoteCharSeq=quoteChar,
						ind=indexes[0][1];
					result=line.substring(0, ind);
					if(quoteChar=='/'){
						var nextChar=line.charAt(ind+1);
						// no need to check if the previous character is * as this function will not be called if a commentary block has started on a previous line
						if(nextChar=='/') // if this is SL comment - '//'
							line=''; // discard the rest of the line
						else if(nextChar=='*'){ // if this is comment starting
						 	// do not process this line
							result=line; 
							line='';
						}// else this is e RegEx literal starting so do nothing yet
					}
					if(line.length){
						line=line.substring(ind+quoteChar.length);
						// find the closing character for this literal
						var closingInd=-1;
						do{
							closingInd=line.indexOf(closingQuoteCharSeq);
							if(closingInd>0){
								// check if it has been escaped
								// count the number is escapes before this character
								var escapes=1;
								while(line.charAt(closingInd-escapes)=='\\')
									++escapes;
								--escapes;
								if(escapes%2){  // if it has been escaped
									line=line.substring(closingInd+1);
									closingInd=-1;
								}
							}else
								break;
						}while(closingInd<0 && line.length);
						if(closingInd==-1) // shouldn't be -1
							return '';
						else
							result+=cleanup(line.substring(closingInd+closingQuoteCharSeq.length));
					}
				}
				return result;
			}
			for(var i=0; i<lines.length; i++){
				this.processingDataStorage.currentLine=i+1;
				var line=lines[i];
				if(processingComment){
					// try to find comment end
					if((ind=line.indexOf('*/'))>-1){
						// found comment end
						
						if(processingComment==1){
							commentContent.push(line.substring(0, ind));
							this.processNextComment(commentContent);
						}
						processingComment=0;
						commentContent=[];
						
						// remove commented content
						lines[i]=line=line.substring(ind+2);
						--i; // get the rest of the line to be processed too
					}else{
						if(processingComment==1)
							// if not found then add the whole line content to the current comment
							commentContent.push(line);
					}
				}else{
					line=cleanup(line);
					// try to find comment start
					if((ind=line.indexOf('/*'))>-1){
						// found comment start
						if(line.charAt(ind+2)=='*'){ // this may be /** type of comment
							if(line.charAt(ind+3)=='/'){ // it's actually just a /**/
								ind+=2;
							}else
								processingComment=1;
						}else // this is /* type of comment
							processingComment=2;
						lines[i]=line.substring(ind+2); // remove non-commented content
						--i; // get the rest of the line to be processed too
					}
				}
			}
			api.sourceFileEnd(fileURL);
		}
	});
	
}());

(function (){
	
	var ns, util, docRenderer;
	
	if(typeof module == 'object' && module.exports){
		util=require('../../lib/util');
		ns=module.exports;
		docRenderer=require('../render/DocumentationRenderer').DocumentationRenderer;
	}else{
		util=window.util;
		ns=util.ns('Documentor.render');
		docRenderer=ns.DocumentationRenderer;
	}
	
	/**
	 * TO-DO: add search facility
	 * TO-DO: move "live" JS code to a separate include so that it can be used in generated static HTML documentation.
	 * TO-DO: add "view-source" feature.
	 */

	/**
	 * @class Documentor.render.PHGDocRenderer
	 * @extends Documentor.render.DocumentationRenderer
	 * @constructor
	 * Renders the documentaion tree.
	 */
	ns.PHGDocRenderer=function (cfg){
		ns.PHGDocRenderer.super_.apply(this, arguments);
	};
	util.inherits(ns.PHGDocRenderer, docRenderer);
	util.extend(ns.PHGDocRenderer.prototype, {
		/**
		 * @cfg {String}	exportPath (optional)
		 * If the option is not given then it is assumed that the code runs in a browser and will render
		 * in the current page. Add this option when running in node.js and the generated content will go into a folder instead. 
		 */
		/**
		 * @cfg {String}	resourceIncludes (optional)	The HTML to include JS and CSS resources. By default it refers to "resources/jquery-1.4.3.min.js" and "resources/PHGDoc.css".
		 */
		resourceIncludes:'<script type="text/javascript" src="resources/jquery-1.4.3.min.js"></script>' +
						'<link rel="stylesheet" href="resources/PHGDoc.css" type="text/css">',
		initialize:function (){
			/**
			 * @cfg {Function} renderFn	(optional)	The rendering function which will print the api tree and details.
			 */
			if(this.api)
				this.render(this.api);
		},
		render:function (api){
			if('exportPath' in this){ // we are writing static doc files
				var fs=require('fs'),
					path=require('path'),
					docPath=path.resolve(this.exportPath);
				function copyResourceFileIf(fileName){
					var targetName=path.resolve(docPath, 'resources', fileName);
					fs.stat(targetName, function (err, stats){
						if(err){ // if it does not exist then copy it over from "resources"
							var resFolder=path.resolve(__dirname, 'resources'),
								targetResFolder=path.dirname(targetName); 
							if(!fs.existsSync(targetResFolder))
								fs.mkdirSync(targetResFolder);
							require('util').pump(
								fs.createReadStream(path.resolve(resFolder, fileName)),
								fs.createWriteStream(targetName, {flags:'w'})
							);
						}
					});
				}
				['jquery-1.4.3.min.js', 'PHGDoc.css', 'images/expanded.png', 'images/collapsed.png', 'images/arrow.gif', 'images/arrow_end.gif'].forEach(copyResourceFileIf);
				var file=fs.createWriteStream(path.resolve(docPath, 'index.html'), { flags: 'w'});
				file.on('error', function (err) {
					console.log(err);
				});
				file.write(['<!DOCTYPE html>',
						'<html>',
						'<head>',
						'<title>'+api.ns.name+'</title>',
						this.resourceIncludes,
						'<meta charset="utf-8">',
						'<script type="text/javascript">(function (){',
						'var renderFn='+this.renderFn.toString()+';',
						'var api='+JSON.stringify({ns:api.ns})+';',
						'api.NSPathSeparator=\''+api.NSPathSeparator+'\';',
						'api.getNSObject='+api.getNSObject.toString()+';',
						'$(document).ready(function (){ renderFn(api); });',
						'}());</script>',
						'</head>',
						'<body>',
						'</body>',
						'</html>'].join('\n'));
								
			}else
				this.renderFn(api);
		},
		renderFn:function (api){
			function printNS(obj){ // print menu items
				var html='<ul>',
					titleStr='';
				if(obj.type=='api')
					titleStr=obj.name.split(api.NSPathSeparator).pop();
				else if(obj.type=='namespace')
					titleStr='<em>namespace</em> '+obj.name.split(api.NSPathSeparator).pop();
				else if(obj.type=='module')
					titleStr='<em>module</em> '+obj.name.split(api.NSPathSeparator).pop();
				else{
					titleStr='<span>'+obj.name.split(api.NSPathSeparator).pop();
					if(obj.flags && !$.isEmptyObject(obj.flags)){
						var flags=[];
						for(var f in obj.flags)
							if(obj.flags[f])
								flags.push(f.charAt(0));
						if(flags.length)
							titleStr+=' <span class="object-attributes">('+flags.join()+')</span>';
					}
					titleStr+='</span>';
				}
				html+='<li class="object-title obj-link" ns-path="'+obj.name+'">'+titleStr+'</li>';
				
				var children=[];
				for(var c in obj.children)
					children.push(obj.children[c]);
				children.sort(function (a, b){
					return (a.name<b.name?-1:(a.name>b.name?1:0));
				});
				for(var i=0; i<children.length; ++i){
					html+='<li class="children-list">'+printNS(children[i])+'</li>';
				}
				
				html+='</ul>';
				return html;
			}
			$('body').append('<div id="selectionInfoWrap"><div id="selectionInfo"></div></div><div id="apiTreeWrap"><div id="apiTree">'+printNS(api.ns)+'</div></div>');
			var storage={
				hideInherited:false
			};
			function renderObj(obj){
				storage.obj=obj;
				var hierarchy=[[obj.name, obj]],
					html='',
					list;
				if('extends' in obj){
					var parentClass=obj['extends'],
						parentClassObj=api.getNSObject(parentClass);
					do{
						var hObj=[parentClass, null];
						hierarchy.unshift(hObj);
						if(parentClassObj){
							hObj[1]=parentClassObj;
							if('extends' in parentClassObj){
								parentClass=parentClassObj['extends'];
								parentClassObj=api.getNSObject(parentClass);
							}else
								parentClass=null;
						}else
							parentClass=null;
					}while(parentClass);
					var cls=hierarchy[0];
					html+='<div class="hierarchy"><em>hierarchy:</em> <div class="hierarchy-item"><div class="hierarchy-item-title'+(cls[1]?(' obj-link" ns-path="'+cls[0]+'"'):'"')+'>'+cls[0]+'</div>';
					var ending='<div class="hierarchy-item hierarchy-sub-item"><div class="hierarchy-item-title">'+hierarchy[hierarchy.length-1][0]+'</div></div>' +
							'</div></div>';
					for(var i=1; i<hierarchy.length-1; i++){
						html+='<div class="hierarchy-item hierarchy-sub-item"><div class="hierarchy-item-title'+(hierarchy[i][1]?(' obj-link" ns-path="'+hierarchy[i][0]+'"'):'"')+'>'+hierarchy[i][0]+'</div>';
						ending+='</div>';
					}
					html+=ending;
				}
				html+='<div><em>'+(obj.type!='api'?obj.type:'')+'</em> <strong>'+obj.name+'</strong>';
				if(!$.isEmptyObject(obj.flags)){
					var flags=[];
					for(var f in obj.flags)
						if(obj.flags[f])
							flags.push(f);
					if(flags.length)
						html+='<div><span class="object-attributes">( '+flags.join()+' )</span></div>';
				}
				if('definedIn' in obj){
					html+='<div class="defined-in"><em>defined in:</em> '+obj.definedIn.split('/').pop()+'</div>';
				}
				if(obj.description)
					html+='<p>'+obj.description+'</p>';
				if('subclasses' in obj){
					list=[];
					for(var i=0; i<obj.subclasses.length; i++)
						list.push('<span class="obj-link" ns-path="'+obj.subclasses[i].name+'">'+obj.subclasses[i].name+'</span>');
					html+='<p><em>subclasses:</em> '+list.join(', ')+'</p>';
				}				
				html+='</div>';
				html+='<div class="clear">';
				if(obj.type=='class')
					html+='<input type="checkbox"'+(storage.hideInherited?' checked':'')+' class="hide-inherited"> hide inherited';
				html+='</div>';
				
				/**
				 */
				function getMembersList(type){
					var members={}, list=[];
					// put members from all parents in the hash
					for(var i=storage.hideInherited?(hierarchy.length-1):0; i<hierarchy.length; ++i)
						if(hierarchy[i][1]) // if this class is in the API
							for(var m in hierarchy[i][1][type])
								if(!(m in members)) // skip overriden members
									members[m]=$.extend({definingClass:hierarchy[i][1].name}, hierarchy[i][1][type][m]);
					// move the members to a list
					for(var m in members)
						list.push(members[m]);
					// sort the list ASC by member name
					list.sort(function (a, b){
						return a.name<b.name?-1:(a.name>b.name?1:0);
					});
					return list;
				}
				// config
				if('config' in obj){
					list=getMembersList('config');
					if(list.length){
						html+='<div class="members">' +
								'<div class="members-head"><em class="members-title">configuration options:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
										'<div class="member-expand">&nbsp;</div>' +
										'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
										'<div class="member-title"><strong>'+list[i].name+'</strong> : '+list[i].dataType+'</div>' +
										'<div class="member-summary">';
							var summary=list[i].summary||list[i].description;
							if(summary)
								html+=summary.substring(0, 100);
							if(summary.length>100)
								html+='...';
							html+='</div>' +
	//										'<div class="member-summary">'+(list[i].summary||list[i].description).substring(0, 100)+'...</div>' +
										'<div class="member-description">'+(list[i].description||list[i].summary)+'</div>' +
									'</div>';
						}
						html+='</div>';
					}
				}
				// properties
				if('properties' in obj){
					list=getMembersList('properties');
					if(list.length){
						html+='<div class="members">' +
								'<div class="members-head"><em class="members-title">properties:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
										'<div class="member-expand">&nbsp;</div>' +
										'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
										'<div class="member-title"><strong>'+list[i].name+'</strong> : '+list[i].dataType+'</div>' +
										'<div class="member-summary">';
							var summary=list[i].summary||list[i].description;
							if(summary)
								html+=summary.substring(0, 100);
							if(summary.length>100)
								html+='...';
							html+='</div>' +
										'<div class="member-description">'+(list[i].description||list[i].summary)+'</div>' +
									'</div>';
						}
						html+='</div>';
					}
				}
				// methods
				if('methods' in obj){
					list=getMembersList('methods');
					if(list.length){
						html+='<div class="members"><div class="members-head"><em class="members-title">methods:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
									'<div class="member-expand">&nbsp;</div>' +
									'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
									'<div class="member-title"><strong>'+list[i].name+'</strong>( ';
							var paramsList=[];
							for(var p=0; p<list[i].params.length; ++p){
								var paramStr=list[i].params[p].dataType+' <span class="pre">'+list[i].params[p].name+'</span>';
								if(list[i].params[p].optional)
									paramStr='['+paramStr+']';
								paramsList.push(paramStr);
							}
							html+=paramsList.join(', ');
							html+=' ) : '+(list[i].returns.type||'void');
							if(!$.isEmptyObject(list[i].flags)){
								var flags=[];
								for(var f in list[i].flags)
									if(list[i].flags[f])
										flags.push(f);
								if(flags.length){
									html+=' [';
									for(var f=0; f<flags.length; ++f)
										html+='<span class="method-flag">'+flags[f]+'</span>';
									html+=']';
								}
							}
							html+='</div>' +
									'<div class="member-summary">'+(list[i].summary || list[i].description)+'</div>'+
									'<div class="member-description"><div>'+(list[i].description||list[i].summary)+'</div>';
							// add Parameters and Returns (if any) to member-description 
							if(paramsList.length){
								html+='Parameters:<ul>';
								for(var p=0; p<list[i].params.length; ++p){
									html+='<li><span class="pre">'+list[i].params[p].name+'</span> : '+list[i].params[p].dataType+'<div>';
									if(list[i].params[p].optional)
										html+='(optional) ';
									html+=(list[i].params[p].description)+'</div></li>'; // ||list[i].params[p].summary
								}
								html+='</ul>';
							}
							if(list[i].returns.type!='void'){
								html+='Returns:<ul>';
								html+='<li><span class="pre">'+list[i].returns.type+'</span><div>'+list[i].returns.summary+'</div></li>';
								html+='</ul>';
							}
							html+='</div></div>';
						}
						html+='</div>';
					}
				}
				// events
				if('events' in obj){
					list=getMembersList('events');
					if(list.length){
						html+='<div class="members"><div class="members-head"><em class="members-title">events:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
									'<div class="member-expand">&nbsp;</div>' +
									'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
									'<div class="member-title"><strong>'+list[i].name+'</strong>( ';
							var paramsString=[];
							for(var p=0; p<list[i].params.length; ++p)
								paramsString.push(list[i].params[p].dataType+' <span class="pre">'+list[i].params[p].name+'</span>');
							html+=paramsString.join(', ');
							html+=' )</div>' +
									'<div class="member-summary">'+(list[i].summary || list[i].description)+'</div>' +
									'<div class="member-description"><div>'+(list[i].description || list[i].summary)+'</div>';
							// add Parameters (if any) to member-description 
							if(paramsString.length){
								html+='Parameters:<ul>';
								for(var p=0; p<list[i].params.length; ++p)
									html+='<li><span class="pre">'+list[i].params[p].name+'</span> : '+list[i].params[p].dataType+'<div>'+(list[i].params[p].description)+'</div></li>';
								html+='</ul>';
							}
							html+='</div></div>';
						}
						html+='</div>';
					}
				}
				
				$('#selectionInfo').html(html);
			}
			if(!this.hasAttachedListeners){
				$('.hide-inherited').live('click', function (){
					storage.hideInherited=this.checked;
					renderObj(storage.obj);
				});
				$('.obj-link').live('click', function (){
					location.hash=$(this).attr('ns-path');
		//				renderObj(api.getNSObject($(this).attr('ns-path')));
				});
				$('.member-expand').live('click', function (){
					$(this).parent().toggleClass('expanded');
				});

				$(window).bind( 'hashchange', renderObjectFromHash);
				$(window).bind('resize', function (){
					$('#selectionInfoWrap, #apiTreeWrap').height($(window).height()-10);
				});
				this.hasAttachedListeners=true;
			}
			
			function renderObjectFromHash(){
				$('.object-title.active').removeClass('active');
				var obj=api.getNSObject(location.hash.substring(1));
				if(obj){
					$('.object-title[ns-path='+obj.name+']').addClass('active');
					renderObj(obj);
				}
			}
			$(window).trigger('resize');
			(function (){
				// run through all classes and compile their "subclasses"
				function processObj(obj){
					if(obj.type=='class' && obj['extends']){
						var extObj=api.getNSObject(obj['extends']);
						if(extObj){
							if(!extObj.subclasses)
								extObj.subclasses=[];
							extObj.subclasses.push(obj);
						}
					}
					if(obj.children)
						for(var c in obj.children)
							processObj(obj.children[c]);
				}
				processObj(api.ns);
			}());
				
			if(location.hash!='')
				renderObjectFromHash();
		}
	});
	
}());
