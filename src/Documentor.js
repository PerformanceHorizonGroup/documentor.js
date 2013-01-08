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
			var defNS={
				name:'API',
				type:'api',
				children:{}
			};
			/**
			 * @property	{Object}	ns
			 * This object has the complete API description. It has very little upon creation but the SourceProcessor object's job is to fill it with details.
			 */
			if('ns' in this)
				this.ns=util.extend(true, defNS, this.ns);
			else
				this.ns=defNS;
			/**
			 * @cfg	{Documentor.SourceLoader}	sourceLoader
			 * The loader to use.
			 */
			/**
			 * @cfg	{Documentor.render.DocumentationRenderer}	renderer
			 * If provided will call its render() method after the last source file is processed.
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
			
			// process all files
			var fileLoadedCb=function (fileData, fileURL){
					this.sourceProcessor.process(fileData, this, fileURL);
				}.scope(this);
			for(var i=0; i<this.sourceFiles.length; i++){
				var d=this.sourceLoader.getSourceFile(this.sourceFiles[i], fileLoadedCb);
				if(d) // if the loader returned contents synchronously
					fileLoadedCb(d, this.sourceFiles[i]);
			}
		},
		sourceFileEnd:function (fileURL){
			var ind=util.inArray(fileURL, this.sourceFiles);
			if(ind>-1)
				this.sourceFiles.splice(ind, 1);
	        /**
	         * @event sourceProcessed
	         * Fires when a source file has been processed.
	         * @param {Documentor.Api} this
	         * @param {String}	fileURL
	         */
			this.emit('sourceProcessed', this, fileURL);
			if(this.sourceFiles.length==0 && this.renderer)
				this.renderer.render(this);
		},
		/**
		 * @method	getNSObject
		 * Returns the namespace object on the given path.
		 * @param	{String} path
		 * @param	{Boolean} autoCreate (optional) Set to true to have a "namespace" object created if nothing exists for that path.
		 * @return	{Object}	The object on that path.
		 */
		getNSObject:function (path, autoCreate){
			var obj=this.ns,
				pathNames = typeof path=='string'?path.split(this.NSPathSeparator):path;
			if(typeof path=='string')
				pathNames=path.split(this.NSPathSeparator);
			else{
				pathNames=path;
				path=path.join(this.NSPathSeparator);
			}
			if(pathNames.length){
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
								children:{}
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
