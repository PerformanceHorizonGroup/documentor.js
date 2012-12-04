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
		'../src/render/PHGDoc/PHGDocRenderer.js'
	],
	sourceLoader:new (require('../src/SourceLoader').FileSourceLoader)(),
	sourceProcessor:new (require('../src/SourceProcessor').PHGSourceProcessor)(),
	listeners:{
		'sourceProcessed':function (fileURL){
			if(api.sourceFiles.length==0)
				(new (require('../src/render/PHGDoc/PHGDocRenderer').PHGDocRenderer)({exportPath:'.'})).render(this);
		}
	}
});
