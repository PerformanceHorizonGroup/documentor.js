var fs=require('fs'),
	outputPath=__dirname+require('path').sep;

console.log('working...');

function bundle(ws, files, cb){
	function bundleNext(){
		var fn=files.shift();
		if(fn){
			var rs=fs.createReadStream(outputPath+fn);
			rs.on('open', function (){
				rs.pipe(ws, {
					end:false
				});
				rs.on('end', bundleNext);
			});
		}else{
			cb && cb();
		}
	}
	bundleNext();
}
function minify(fileName, cb){
	try{
		var packedFileName=fileName.replace(/\.js$/, '.min.js');
		require('yuicompressor').compress(fileName, function (err, data, extra){
			if(err){
				console.log(err);
				console.log('failed compressing: '+fileName);
				return;
			}else{
				fs.writeFile(packedFileName, data, function (err){
					if(err){
						console.log(err);
						console.log('failed writing: '+packedFileName);
						return;
					}else
						console.log('packed to '+packedFileName);
					cb && cb(err);
				});
			}
		});
		console.log('compressing '+fileName+' ...');
	}catch(e){
		console.log('[WARN] could not create minified '+packedFileName+'!');
		cb && cb(e);
	}
}

var buildFns=[function (doneCb){
	console.log('creating full package ...');
	var outputFileName=outputPath+'documentor.js',
		ws=fs.createWriteStream(outputFileName),
		files=[
			'../lib/util.js',
			'../lib/events.js',
			
			'../src/Documentor.js',
			'../src/SourceLoader.js',
			'../src/SourceProcessor.js',
			'../src/DocumentationRenderer.js',
			
			'../src/PHGDoc/PHGSourceProcessor.js',
			'../src/PHGDoc/PHGDocRenderer.js'
		];
	ws.write('/*!\n\
	 * Documentor.js\n\
	 * Copyright(c) 2012-2013 Georgi Kostov <p_e_a@gbg.bg>, http://performancehorizon.com\n\
	 * https://github.com/PerformanceHorizonGroup/documentor.js\n\
	 * MIT Licensed\n\
	 */\n\
	');
	
	bundle(ws, files, function (){
		ws.end();
		
		// try to pack it
		minify(outputFileName, doneCb);
	});
},function (doneCb){
	console.log('creating PHGDoc package ...');
	var outputFileName=outputPath+'PHGDoc.js',
		ws=fs.createWriteStream(outputFileName),
		files=[
			'../lib/util.js',
			'../lib/events.js',
			
//			'../src/Documentor.js',
//			'../src/SourceLoader.js',
//			'../src/SourceProcessor.js',
			'../src/DocumentationRenderer.js',
			
//			'../src/PHGDoc/PHGSourceProcessor.js',
			'../src/PHGDoc/PHGDocRenderer.js'
		];
	ws.write('/*!\n\
	 * PHGDoc.js\n\
	 * Copyright(c) 2012-2013 Georgi Kostov <p_e_a@gbg.bg>, http://performancehorizon.com\n\
	 * https://github.com/PerformanceHorizonGroup/documentor.js\n\
	 * MIT Licensed\n\
	 */\n\
	');
	
	bundle(ws, files, function (){
		ws.end();
		
		// try to pack it
		minify(outputFileName, doneCb);
	});
}, function (doneCb){
	// build the docs
	require('../docs/docs.js');
}];

(function build(){
	var fn=buildFns.shift();
	fn&&fn(build);
}());



