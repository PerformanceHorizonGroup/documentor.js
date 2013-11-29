module.exports=require('./src/Documentor');
/**
 * TO-DO: have these loaded in some more automated way (by reading the file system for ex.)
 */

function extend(obj, files){
	files.forEach(function (m){
			var x=require(m),
				props = Object.getOwnPropertyNames(x);
			props.forEach(function(name) {
				obj[name]=x[name];
			});
		});
}

extend(module.exports, ['./src/SourceLoader', './src/SourceProcessor']);
extend(module.exports.render={}, ['./src/render/DocumentationRenderer']);
extend(module.exports.PHGDoc={}, ['./src/PHGDoc/PHGDocRenderer', './src/PHGDoc/PHGSourceProcessor']);

