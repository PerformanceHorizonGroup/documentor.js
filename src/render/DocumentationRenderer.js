
(function (){
	
	var ns,
		emitter,
		util;
	
	if(typeof module == 'object' && module.exports){
		util=require('../../lib/util');
		ns=module.exports;
		emitter=require('../../lib/events').EventEmitter;
	}else{
		util=window.util;
		ns=util.ns('Documentor.render');
		emitter=window.EventEmitter;
	}
	
	/**
	 * @class Documentor.render.DocumentationRenderer
	 * @constructor
	 * @extends	EventEmitter
	 * Base class for a documentation renderer.
	 */
	ns.DocumentationRenderer=function (cfg){
//		util.extend(this, cfg);
		ns.DocumentationRenderer.super_.apply(this, arguments);
		this.initialize();
	};
	util.inherits(ns.DocumentationRenderer, emitter);

	util.extend(ns.DocumentationRenderer.prototype, {
		initialize:util.noop,
		/**
		 * @method render
		 * Renders the documentation from the given API object
		 * @param	{Documentor.Api}	api	The API object to render.
		 */
		render:function (){
		    /**
		     * @event render
		     * Fires when the documentation is rendered.
		     * @param {Documentor.Api} this
		     */
			this.emit('render', this);
		}
	});

}());
