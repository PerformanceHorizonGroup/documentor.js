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
	
}());