var fs=require('fs'),
	outputFileName=__dirname+require('path').sep+'documentor.js',
	files=[
		'../lib/util.js',
		'../lib/events.js',
		
		'../src/Documentor.js',
		'../src/SourceLoader.js',
		'../src/SourceProcessor.js',
		'../src/render/DocumentationRenderer.js',
		
		'../src/PHGDoc/PHGSourceProcessor.js',
		'../src/PHGDoc/PHGDocRenderer.js'
	];

console.log('working...');
var ws=fs.createWriteStream(outputFileName);
ws.write('/*!\n\
 * Documentor.js\n\
 * Copyright(c) 2012-2013 Georgi Kostov <p_e_a@gbg.bg>, http://performancehorizon.com\n\
 * https://github.com/PerformanceHorizonGroup/documentor.js\n\
 * MIT Licensed\n\
 */\n\
');

function bundle(){
	var fn=files.shift();
	if(fn){
		var rs=fs.createReadStream(fn);
		rs.on('open', function (){
			rs.pipe(ws, {
				end:false
			});
			rs.on('end', bundle);
		});
	}else{
		ws.end();
		
		// try to pack it
		try{
			require('yuicompressor').compress(outputFileName, function (err, data, extra){
				if(err){
					console.log(err);
					console.log('failed compressing: '+outputFileName);
					return;
				}else{
					var packedFileName=outputFileName.replace(/\.js$/, '.min.js');
					fs.writeFile(packedFileName, data, function (err){
						if(err){
							console.log(err);
							console.log('failed writing: '+packedFileName);
							return;
						}else
							console.log('packed to '+packedFileName);
					});
				}
			});
		}catch(e){
			console.log('[WARN] could not create minified!');
		}
	}
}

bundle();
