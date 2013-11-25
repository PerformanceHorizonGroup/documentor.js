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
