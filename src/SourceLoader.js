
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
		initialize:util.noop
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
			if(cb)
				jQuery.ajax({
					url:fileURL,
					dataType:'text',
					success:function (data, textStatus, jqXHR){
						cb(data, fileURL);
					}
				});
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
			if(cb)
				fs.readFile(fn, 'utf8', function (err, data){
					cb(err?null:data, fileName);
				});
			else
				return fs.readFileSync(fn, 'utf8');
		}
	});
	
}());
