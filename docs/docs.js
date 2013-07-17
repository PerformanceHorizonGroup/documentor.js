var api=new (require('../src/Documentor').Api)({
	ns:{
		name:'Documentor',
		description:'Generates source code documentation'
	},
	sourceFiles:[
		'../src/Documentor.js',
		'../src/SourceLoader.js',
		'../src/SourceProcessor.js',
		'../src/render/DocumentationRenderer.js',
		'../src/PHGDoc/PHGSourceProcessor.js',
		'../src/PHGDoc/PHGDocRenderer.js'
	],
	sourceLoader:new (require('../src/SourceLoader').FileSourceLoader)(),
	sourceProcessor:new (require('../src/PHGDoc/PHGSourceProcessor').PHGSourceProcessor)(),
	renderer:new (require('../src/PHGDoc/PHGDocRenderer').PHGDocRenderer)({exportPath:'.'}),
	listeners:{
		'sourceProcessed':function (fileURL){
			if(api.sourceFiles.length==0){ // if source processing is over
				// try to set the content of README.md as the desription of the Documentor namespace 
				var d=api.getNSObject('Documentor');
				if(d)
					d.description=require('../lib/other/markdown-js/markdown').toHTML(api.sourceLoader.getSourceFile('../README.md'));
			}
		}
	}
});
