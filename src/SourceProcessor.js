
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
