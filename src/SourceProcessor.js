
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
	 * @class Documentor.SourceProcessor
	 * @constructor
	 * Base class for a source file prcessor.
	 */
	Documentor.SourceProcessor=function (cfg){
		util.extend(this, cfg);
		this.initialize();
	};
	util.extend(Documentor.SourceProcessor.prototype, {
		initialize:util.noop
		/**
		 * @method	process
		 * Parses the source code and updates the specified API object. 
		 * @param	{String}	fileData	Source file contents.
		 * @param	{Documentor.Api}	api	The API object to amend.
		 */
	});

	/**
	 * @class Documentor.PHGSourceProcessor
	 * @extends Documentor.SourceProcessor
	 * @constructor
	 * Source file processor for JS source code from PHG. It extracts and processes javaDoc style comments in source.
	 * The set of tags it recognizes is mostly borrowed from ExtJS.
	 */
	Documentor.PHGSourceProcessor=function (cfg){
		Documentor.PHGSourceProcessor.super_.apply(this, arguments);
	};

	util.inherits(Documentor.PHGSourceProcessor, Documentor.SourceProcessor);

	var tagMatcher=new RegExp('^\\s*@([A-Za-z]+)(\\s+|$)');
	var commentLineStartMatcher=/^\s*\*/,
		simpleTagParamMatcher=/^\S*/,
		paramTagParametersMatcher=/^\{(\S*)\}\s(\S*)(\s\(optional\))?/,
		returnTagMatcher=/^\{(\S*)\}/;
	
	util.extend(Documentor.PHGSourceProcessor.prototype, {
		/**
		 * @property	{Object}	docTagProcessors
		 * A hash keyed by the tag names that this object can process. At each key there's a parser function which will be given a line to process. 
		 */
		docTagProcessors:{
			// these are called with scope set to the PHGSourceProcessor object
			'class':function (line){
				// start a new class definition
				// the text after @class is taken as the name of the class and the rest of the line is a short summary of the class
				var match=line.match(simpleTagParamMatcher),
					name=match[0];
				if(this.processingDataStorage.currentModuleObj)
					name=this.processingDataStorage.currentModuleObj.name+'.'+name;
				var classNamePath = name.split('.'),
					className=classNamePath.pop(),
					nsObject=this.processingDataStorage.api.getNSObject(classNamePath, true),
					classObj=nsObject.children[className];
				if(!classObj){
					classObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						config:{},
						properties:{},
						methods:{},
						events:{},
						definedIn:this.processingDataStorage.fileURL,
						flags:{}
					};
					nsObject.children[className]=classObj;
				}
				util.extend(classObj, {
					type:'class',
					name:name
				});
				this.processingDataStorage.currentClassObj=classObj;
				this.processingDataStorage.currentDescribableObj=classObj;
			},
			'module':function (line){
				// start a new module definition
				// the text after @module is taken as the name of the class and the rest of the line is a short summary of the class
				var match=line.match(simpleTagParamMatcher),
					name=match[0]||this.processingDataStorage.fileURL.split('/').pop().replace(/\.js$/, ''),
					nsObject=this.processingDataStorage.api.ns,
					moduleObj=nsObject.children[name];
				if(!moduleObj){
					moduleObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						children:[],
						config:{},
						properties:{},
						methods:{},
						events:{},
						definedIn:this.processingDataStorage.fileURL
					};
					nsObject.children[name]=moduleObj;
				}
				util.extend(moduleObj, {
					type:'module',
					name:name
				});
				this.processingDataStorage.currentModuleObj=moduleObj;
				this.processingDataStorage.currentDescribableObj=moduleObj;
			},
			'moduleFunction':function (line){
				if(!this.processingDataStorage.currentModuleObj){
					console.warn('@method tag must appear *after* @module !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
					return;
				}
				// method definition
				// the text after @method is taken as the name of the method and the rest of the line is a short summary of the method
				var match=line.match(simpleTagParamMatcher),
					name=match[0],
					methodObj=this.processingDataStorage.currentModuleObj.methods[name];
				if(!methodObj){
					methodObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						params:[],
						returns:{
							type:'void',
							summary:''
						},
						flags:{}
					};
					this.processingDataStorage.currentModuleObj.methods[name]=methodObj;
				}
				this.processingDataStorage.currentParamOwnerObj=methodObj;
				this.processingDataStorage.currentMethodObj=methodObj;
				this.processingDataStorage.currentDescribableObj=methodObj;
			},
			'cfg':function (line){
				// configuration option
				// the text after @cfg should be like: {DataType} configName Summary text for the option
				var match=line.match(paramTagParametersMatcher),
					dataType=match[1],
					name=match[2],
					cfgObj=this.processingDataStorage.currentClassObj.config[name];
				if(!cfgObj){
					cfgObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						dataType:dataType
					};
					this.processingDataStorage.currentClassObj.config[name]=cfgObj;
				}
				this.processingDataStorage.currentDescribableObj=cfgObj;
			},
			'property':function (line){
				// property
				// the text after @property should be like: {DataType} propertyName Summary text for the property
				var match=line.match(paramTagParametersMatcher),
					dataType=match[1],
					name=match[2],
					propObj=this.processingDataStorage.currentClassObj.properties[name];
				if(!propObj){
					propObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						dataType:dataType
					};
					this.processingDataStorage.currentClassObj.properties[name]=propObj;
				}
				this.processingDataStorage.currentDescribableObj=propObj;
			},
			'method':function (line){
				if(!this.processingDataStorage.currentClassObj){
					console.warn('@method tag must appear *after* @class !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
					return;
				}
				// method definition
				// the text after @method is taken as the name of the method and the rest of the line is a short summary of the method
				var match=line.match(simpleTagParamMatcher),
					name=match[0],
					methodObj=this.processingDataStorage.currentClassObj.methods[name];
				if(!methodObj){
					methodObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						params:[],
						returns:{
							type:'void',
							summary:''
						},
						flags:{}
					};
					this.processingDataStorage.currentClassObj.methods[name]=methodObj;
				}
				this.processingDataStorage.currentParamOwnerObj=methodObj;
				this.processingDataStorage.currentMethodObj=methodObj;
				this.processingDataStorage.currentDescribableObj=methodObj;
			},
			'event':function (line){
				if(!this.processingDataStorage.currentClassObj){
					console.warn('@event tag must appear *after* @class !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
					return;
				}
				// event definition
				// the text after @event is taken as the name of the event and the rest of the line is a short summary of the event
				var match=line.match(simpleTagParamMatcher),
					name=match[0],
					eventObj=this.processingDataStorage.currentClassObj.events[name];
				if(!eventObj){
					eventObj={
						description:'',
						summary:line.substring(match[0].length).replace(/^\s+/,''),
						name:name,
						params:[]
					};
					this.processingDataStorage.currentClassObj.events[name]=eventObj;
				}
				this.processingDataStorage.currentParamOwnerObj=eventObj;
				this.processingDataStorage.currentDescribableObj=eventObj;
			},
			'param':function (line){
				// param definition
				// the text after @param should be like: {DataType} paramName Summary text for the parameter
				var match=line.match(paramTagParametersMatcher),
					paramObj={
						description:line.substring(match[0].length).replace(/^\s+/,''), // add +1 to skip the space following
//						summary:line.substring(match[0].length).replace(/^\s+/,''), // add +1 to skip the space following
						name:match[2],
						optional:!!match[3],
						dataType:match[1]
					};
				if(this.processingDataStorage.currentParamOwnerObj)
					this.processingDataStorage.currentParamOwnerObj.params.push(paramObj);
				else
					console.warn('@param tag must appear *after* @method or @event !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
				this.processingDataStorage.currentDescribableObj=paramObj;
			},
			'extends':function (line){
				// the text after @extends is taken as the name of the base class
				/**
				 * TO-DO: may add a check if a @class is currently being processed
				 */
				this.processingDataStorage.currentClassObj['extends'] = line.match(simpleTagParamMatcher)[0];		
			},
			'singleton':function (line){
				// the text after @extends is taken as the name of the base class
				/**
				 * TO-DO: may add a check if a @class is currently being processed
				 */
				this.processingDataStorage.currentClassObj.flags['singleton'] = true;		
			},
			'return':function (line){
				// the text after @return should be like: {DataType} Summary text for the returned value
				var match=line.match(returnTagMatcher);
				if(this.processingDataStorage.currentMethodObj){
					this.processingDataStorage.currentMethodObj.returns.type = match[1];		
					this.processingDataStorage.currentMethodObj.returns.summary = line.substring(match[0].length).replace(/^\s+/,'');		
				}else
					console.warn('@return tag must appear *after* @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			},
			'private':function (line){
				if(this.processingDataStorage.currentDescribableObj)
					this.processingDataStorage.currentDescribableObj.flags['private'] = true;		
				else
					console.warn('@private tag must appear *after* @class or @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			},
			'static':function (line){
				if(this.processingDataStorage.currentMethodObj){
					this.processingDataStorage.currentMethodObj.flags['static'] = true;		
				}else
					console.warn('@return tag must appear *after* @method !!! ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
			}
		},
		processNextComment:function (commentContent){
			// process comment content line-by-line

			// usually lines start with * characters, remove them 
			for(var i=0; i<commentContent.length; i++)
				commentContent[i]=commentContent[i].replace(commentLineStartMatcher, '');
			this.processingDataStorage.currentMethodObj=null; // method attributes must be within the same comment as the method declaration
			this.processingDataStorage.currentParamOwnerObj=null;
			this.processingDataStorage.currentDescribableObj=null; // the description must be within the same comment as the object
			var descriptionTxt=null,
				checkDescriptionText=function (){
					if(descriptionTxt!==null){  // if we've been collecting a description text till now
						if(this.processingDataStorage.currentDescribableObj!=null)  // if there is an object to apply the description to
							this.processingDataStorage.currentDescribableObj.description+=descriptionTxt.replace(/^\s+/,'');
						descriptionTxt=null;
					}
				}.scope(this);
			for(var i=0; i<commentContent.length; i++){
				var line=commentContent[i]; //.replace(commentLineStartMatcher, '');
				var tagMatch=line.match(tagMatcher);
				if(tagMatch){
					checkDescriptionText();
					line=line.substring(tagMatch[0].length); // remove the matched tag part of the line
					// process doc tag
					if(tagMatch[1] in this.docTagProcessors){
						try{
							this.docTagProcessors[tagMatch[1]].call(this, line);
						}catch(e){
							console.error('Esception occured while processing @'+tagMatch[1]+' ['+this.processingDataStorage.fileURL+':'+this.processingDataStorage.currentLine+']');
						}
					}else
						console.warn('unknown tag @'+tagMatch[1]);
				}else if(line.length){
					if(descriptionTxt===null)
						descriptionTxt=line;
					else
						descriptionTxt+=line;
				}
			}
			checkDescriptionText();
		},
		// override
		process:function (fileData, api, fileURL){
//			console.log('file:'+fileURL)
//			console.log('data:'+fileData)
			var ind=-1,
				lines=fileData.split('\n'),
				processingComment=0, // 0 - not processing; 1 - processing /** */ type of comment; 2 - processing /* */ type of comment
				commentContent=[];
			this.processingDataStorage={
				fileURL:fileURL,
				currentLine:-1,
				api:api,
				currentClassObj:null, // the last processed class object
				currentModuleObj:null, // the last processed class object
				currentMethodObj:null, // the last processed class object
				currentDescribableObj:null, // the last processed class or method object. this reference is used when a description text is found.
				currentParamOwnerObj:null // the last processed method or event object. this reference is used when a parameter needs to be processed.
			};
			/**
			 * TO DO: check for multi-line strings which although against the JS standards may still be used by someone
			 */
			function cleanup(line){ // return line;
				// remove string literals, regexes and SL comments untill a comment start is found.
				var indexes=['\'', '\"', '/'],
					result=line;
				for(var i=0; i<indexes.length; ++i){
					var ind=line.indexOf(indexes[i]);
					if(ind<0)
						indexes.splice(i--, 1);
					else
						indexes[i]=[indexes[i], ind];
				}
				if(indexes.length){
					indexes.sort(function (a, b){ return a[1]-b[1]})
					var quoteChar=indexes[0][0],
						closingQuoteCharSeq=quoteChar,
						ind=indexes[0][1];
					result=line.substring(0, ind);
					if(quoteChar=='/'){
						var nextChar=line.charAt(ind+1);
						// no need to check if the previous character is * as this function will not be called if a commentary block has started on a previous line
						if(nextChar=='/') // if this is SL comment - '//'
							line=''; // discard the rest of the line
						else if(nextChar=='*'){ // if this is comment starting
						 	// do not process this line
							result=line; 
							line='';
						}// else this is e RegEx literal starting so do nothing yet
					}
					if(line.length){
						line=line.substring(ind+quoteChar.length);
						// find the closing character for this literal
						var closingInd=-1;
						do{
							closingInd=line.indexOf(closingQuoteCharSeq);
							if(closingInd>0){
								// check if it has been escaped
								// count the number is escapes before this character
								var escapes=1;
								while(line.charAt(closingInd-escapes)=='\\')
									++escapes;
								--escapes;
								if(escapes%2){  // if it has been escaped
									line=line.substring(closingInd+1);
									closingInd=-1;
								}
							}else
								break;
						}while(closingInd<0 && line.length);
						if(closingInd==-1) // shouldn't be -1
							return '';
						else
							result+=cleanup(line.substring(closingInd+closingQuoteCharSeq.length));
					}
				}
				return result;
			}
			for(var i=0; i<lines.length; i++, this.processingDataStorage.currentLine++){
				var line=lines[i];
				if(processingComment){
					// try to find comment end
					if((ind=line.indexOf('*/'))>-1){
						// found comment end
						
						if(processingComment==1){
							commentContent.push(line.substring(0, ind));
							this.processNextComment(commentContent);
						}
						processingComment=0;
						commentContent=[];
						
						// remove commented content
						lines[i]=line=line.substring(ind+2);
						--i; // get the rest of the line to be processed too
					}else{
						if(processingComment==1)
							// if not found then add the whole line content to the current comment
							commentContent.push(line);
					}
				}else{
					line=cleanup(line);
					// try to find comment start
					if((ind=line.indexOf('/*'))>-1){
						// found comment start
						if(line.charAt(ind+2)=='*'){ // this may be /** type of comment
							if(line.charAt(ind+3)=='/'){ // it's actually just a /**/
								ind+=2;
							}else
								processingComment=1;
						}else // this is /* type of comment
							processingComment=2;
						lines[i]=line.substring(ind+2); // remove non-commented content
						--i; // get the rest of the line to be processed too
					}
				}
			}
			api.sourceFileEnd(fileURL);
		}
	});
//	'/** @class sdafdsfads' // this is a test for the string literal removal function
//		/**
//		 * @class	docTagProcessors
//		 */
	
}());
