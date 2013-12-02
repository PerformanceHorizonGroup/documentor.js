console.log('building docs...');

var path=require('path'),
	documentor=require('../'),
	sources=[
		'../src/Documentor.js',
		'../src/SourceLoader.js',
		'../src/SourceProcessor.js',
		'../src/DocumentationRenderer.js',
		'../src/PHGDoc/PHGSourceProcessor.js',
		'../src/PHGDoc/PHGDocRenderer.js'
	];
for(var i=0; i<sources.length; i++)
	sources[i]=path.resolve(__dirname, sources[i]);	// treat them as relative to this directory
new documentor.Api({
		ns:{
			name:'Documentor',
			description:'Generates source code documentation'
		},
		sourceFiles:sources,
		sourceLoader:new documentor.FileSourceLoader(),
		sourceProcessor:new documentor.PHGDoc.PHGSourceProcessor(),
		renderer:new documentor.PHGDoc.PHGDocRenderer({exportPath:__dirname}),
		listeners:{
			'sourceQueueEmpty':function (){
				// try to set the content of README.md as the desription of the Documentor namespace 
				var d=this.getNSObject('Documentor');
				if(d)
					d.description=require('../lib/other/markdown-js/markdown').toHTML(this.sourceLoader.getSourceFile(path.resolve(__dirname, '../README.md')));
			}
		}
	});
