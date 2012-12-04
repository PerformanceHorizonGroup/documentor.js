
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
