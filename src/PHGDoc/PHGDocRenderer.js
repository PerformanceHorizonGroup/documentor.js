
(function (){
	
	var ns, util, docRenderer;
	
	if(typeof module == 'object' && module.exports){
		util=require('../../lib/util');
		ns=module.exports;
		docRenderer=require('../DocumentationRenderer').DocumentationRenderer;
	}else{
		util=window.util;
		ns=util.ns('Documentor.PHGDoc');
		docRenderer=Documentor.DocumentationRenderer;
	}
	
	/**
	 * TO-DO: add search facility
	 * TO-DO: move "live" JS code to a separate include so that it can be used in generated static HTML documentation.
	 * TO-DO: add "view-source" feature.
	 */

	/**
	 * @class Documentor.PHGDoc.PHGDocRenderer
	 * @extends Documentor.DocumentationRenderer
	 * @constructor
	 * Renders the documentaion tree.
	 */
	ns.PHGDocRenderer=function (cfg){
		ns.PHGDocRenderer.super_.apply(this, arguments);
	};
	util.inherits(ns.PHGDocRenderer, docRenderer);
	util.extend(ns.PHGDocRenderer.prototype, {
		/**
		 * @cfg {String}	exportPath (optional)
		 * If the option is not given then it is assumed that the code runs in a browser and will render
		 * in the current page. Add this option when running in node.js and the generated content will go into a folder instead. 
		 */
		/**
		 * @cfg {String}	resourceIncludes (optional)	The HTML to include JS and CSS resources. By default it refers to "resources/jquery-1.4.3.min.js" and "resources/PHGDoc.css".
		 */
		resourceIncludes:{
			scripts:['jquery-1.10.2.js', {src:'../../../build/PHGDoc.js', dest:'PHGDoc.js'}],
			css:['PHGDoc.css'],
			files:['images/expanded.png', 'images/collapsed.png', 'images/arrow.gif', 'images/arrow_end.gif']
		},
		initialize:function (){
			/**
			 * @cfg {Function} renderFn	(optional)	The rendering function which will print the api tree and details.
			 */
			if(this.api)
				this.render(this.api);
		},
		render:function (api){
			if('exportPath' in this){ // we are writing static doc files in node.js
				var fs=require('fs'),
					path=require('path'),
					resFolder=path.resolve(__dirname, 'resources'),
					docPath=path.resolve(this.exportPath);
				function getSrcFileName(f){
					return typeof f=='string'?f:f.src;
				}
				function getDestFileName(f){
					return typeof f=='string'?f:f.dest;
				}
				function cp(src, dest){
					var targetResFolder=path.dirname(dest); 
					if(!fs.existsSync(targetResFolder))
						fs.mkdirSync(targetResFolder);
					require('util').pump(
						fs.createReadStream(src),
						fs.createWriteStream(dest, {flags:'w'})
					);
				}
				function copyResourceFileIf(fileName){
					cp(
						path.resolve(resFolder, getSrcFileName(fileName)), 
						path.resolve(docPath, 'resources', getDestFileName(fileName))
					);
				}
				var file=fs.createWriteStream(path.resolve(docPath, 'index.html'), { flags: 'w'}),
					resourceIncludesHTML='';
				file.on('error', function (err) {
					console.log(err);
				});
				if(this.resourceIncludes){
					if(this.resourceIncludes.scripts){
						for(var i=0, list=this.resourceIncludes.scripts; i<list.length; ++i)
							resourceIncludesHTML+='\n<script type="text/javascript" src="resources/'+getDestFileName(list[i])+'"></script>';
						list.forEach(copyResourceFileIf);
					}
					if(this.resourceIncludes.css){
						for(var i=0, list=this.resourceIncludes.css; i<list.length; ++i)
							resourceIncludesHTML+='\n<link rel="stylesheet" href="resources/'+getDestFileName(list[i])+'" type="text/css">';
						list.forEach(copyResourceFileIf);
					}
					if(this.resourceIncludes.files){
						this.resourceIncludes.files.forEach(copyResourceFileIf);
					}
				}
				file.write(['<!DOCTYPE html>',
						'<html>',
						'<head>',
						'<title>'+api.ns.name+'</title>',
						resourceIncludesHTML,
						'<meta charset="utf-8">',
						'<script type="text/javascript">(function (){',
						'var renderer=new Documentor.PHGDoc.PHGDocRenderer();',
						'var api='+JSON.stringify({ns:api.ns})+';',
						'api.NSPathSeparator=\''+api.NSPathSeparator+'\';',
						'api.getNSObject='+api.getNSObject.toString()+';',
						'$(document).ready(function (){ renderer.render(api); });',
						'}());</script>',
						'</head>',
						'<body>',
						'</body>',
						'</html>'].join('\n'));
			}else
				this.renderFn(api);
			ns.PHGDocRenderer.super_.prototype.render.apply(this, arguments);
		},
		renderFn:function (api){
			var renderer=this;
			function printNS(obj){ // print menu items
				var html='<ul>',
					titleStr='';
				if(obj.type=='api')
					titleStr=obj.name.split(api.NSPathSeparator).pop();
				else if(obj.type=='namespace')
					titleStr='<em>namespace</em> '+obj.name.split(api.NSPathSeparator).pop();
				else if(obj.type=='module')
					titleStr='<em>module</em> '+obj.name.split(api.NSPathSeparator).pop();
				else{
					titleStr='<span>'+obj.name.split(api.NSPathSeparator).pop();
					if(obj.flags && !$.isEmptyObject(obj.flags)){
						var flags=[];
						for(var f in obj.flags)
							if(obj.flags[f])
								flags.push(f.charAt(0));
						if(flags.length)
							titleStr+=' <span class="object-attributes">('+flags.join()+')</span>';
					}
					titleStr+='</span>';
				}
				html+='<li class="object-title obj-link" ns-path="'+obj.name+'">'+titleStr+'</li>';
				
				var children=[];
				for(var c in obj.children)
					children.push(obj.children[c]);
				children.sort(function (a, b){
					return (a.name<b.name?-1:(a.name>b.name?1:0));
				});
				for(var i=0; i<children.length; ++i){
					html+='<li class="children-list">'+printNS(children[i])+'</li>';
				}
				
				html+='</ul>';
				return html;
			}
			$(this.containerSelector||'body').append('<div id="selectionInfoWrap"><div id="selectionInfo"></div></div><div id="apiTreeWrap"><div id="apiTree">'+printNS(api.ns)+'</div></div>');
			var storage={
				hideInherited:false
			};
			function renderObj(obj){
				storage.obj=obj;
				var hierarchy=[[obj.name, obj]],
					html='',
					list;
					
				var rightSidepanel='';
				if('extends' in obj){
					var parentClass=obj['extends'],
						parentClassObj=api.getNSObject(parentClass);
					do{
						var hObj=[parentClass, null];
						hierarchy.unshift(hObj);
						if(parentClassObj){
							hObj[1]=parentClassObj;
							if('extends' in parentClassObj){
								parentClass=parentClassObj['extends'];
								parentClassObj=api.getNSObject(parentClass);
							}else
								parentClass=null;
						}else
							parentClass=null;
					}while(parentClass);
					var cls=hierarchy[0];
					rightSidepanel+='<div class="hierarchy"><em>hierarchy:</em> <div class="hierarchy-item"><div class="hierarchy-item-title'+(cls[1]?(' obj-link" ns-path="'+cls[0]+'"'):'"')+'>'+cls[0]+'</div>';
					var ending='<div class="hierarchy-item hierarchy-sub-item"><div class="hierarchy-item-title">'+hierarchy[hierarchy.length-1][0]+'</div></div>' +
							'</div></div>';
					for(var i=1; i<hierarchy.length-1; i++){
						rightSidepanel+='<div class="hierarchy-item hierarchy-sub-item"><div class="hierarchy-item-title'+(hierarchy[i][1]?(' obj-link" ns-path="'+hierarchy[i][0]+'"'):'"')+'>'+hierarchy[i][0]+'</div>';
						ending+='</div>';
					}
					rightSidepanel+=ending;
				}
				if(obj.mixins.length){
					rightSidepanel+='<div class="hierarchy"><em>mixins:</em>';
					for(var i=0; i<obj.mixins.length; i++)
						rightSidepanel+='<div class="hierarchy-item"><div class="hierarchy-item-title obj-link" ns-path="'+obj.mixins[i]+'">'+obj.mixins[i]+'</div></div>';
					rightSidepanel+='</div>';
				}
				if(rightSidepanel)
					html+='<div class="right-side-panel">'+rightSidepanel+'</div>';

				html+='<div><em>'+(obj.type!='api'?obj.type:'')+'</em> <strong>'+obj.name+'</strong>';
				if(!$.isEmptyObject(obj.flags)){
					var flags=[];
					for(var f in obj.flags)
						if(obj.flags[f])
							flags.push(f);
					if(flags.length)
						html+='<div><span class="object-attributes">( '+flags.join()+' )</span></div>';
				}
				if('definedIn' in obj){
					html+='<div class="defined-in"><em>defined in:</em> <a class="file-name" target="_blank" href="'+obj.definedIn+'">'+obj.definedIn.split('/').pop()+'</a></div>';
				}
				if(obj.description)
					html+='<p>'+obj.description+'</p>';
				if('subclasses' in obj){
					list=[];
					for(var i=0; i<obj.subclasses.length; i++)
						list.push('<span class="obj-link" ns-path="'+obj.subclasses[i].name+'">'+obj.subclasses[i].name+'</span>');
					html+='<p><em>subclasses:</em> '+list.join(', ')+'</p>';
				}				
				html+='</div>';
				html+='<div class="clear">';
				if(obj.type=='class')
					html+='<input type="checkbox"'+(storage.hideInherited?' checked':'')+' class="hide-inherited"> hide inherited';
				html+='</div>';
				
				/**
				 */
				function getMembersList(type){
					var members={}, list=[];
					// put members from all parents in the hash
					for(var i=storage.hideInherited?(hierarchy.length-1):0; i<hierarchy.length; ++i)
						if(hierarchy[i][1]) // if this class is in the API
							for(var m in hierarchy[i][1][type])
								if(!(m in members)) // skip overriden members
									members[m]=$.extend({definingClass:hierarchy[i][1].name}, hierarchy[i][1][type][m]);
					// move the members to a list
					for(var m in members)
						list.push(members[m]);
					// sort the list ASC by member name
					list.sort(function (a, b){
						return a.name<b.name?-1:(a.name>b.name?1:0);
					});
					return list;
				}
				// config
				if('config' in obj){
					list=getMembersList('config');
					if(list.length){
						html+='<div class="members">' +
								'<div class="members-head"><em class="members-title">configuration options:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
										'<div class="member-expand">&nbsp;</div>' +
										'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
										'<div class="member-title"><strong>'+list[i].name+'</strong> : '+list[i].dataType+'</div>' +
										'<div class="member-summary">';
							var summary=list[i].summary||list[i].description;
							if(summary)
								html+=summary.substring(0, 100);
							if(summary.length>100)
								html+='...';
							html+='</div>' +
	//										'<div class="member-summary">'+(list[i].summary||list[i].description).substring(0, 100)+'...</div>' +
										'<div class="member-description">'+(list[i].description||list[i].summary)+'</div>' +
									'</div>';
						}
						html+='</div>';
					}
				}
				// properties
				if('properties' in obj){
					list=getMembersList('properties');
					if(list.length){
						html+='<div class="members">' +
								'<div class="members-head"><em class="members-title">properties:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
										'<div class="member-expand">&nbsp;</div>' +
										'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
										'<div class="member-title"><strong>'+list[i].name+'</strong> : '+list[i].dataType+'</div>' +
										'<div class="member-summary">';
							var summary=list[i].summary||list[i].description;
							if(summary)
								html+=summary.substring(0, 100);
							if(summary.length>100)
								html+='...';
							html+='</div>' +
										'<div class="member-description">'+(list[i].description||list[i].summary)+'</div>' +
									'</div>';
						}
						html+='</div>';
					}
				}
				// methods
				if('methods' in obj){
					list=getMembersList('methods');
					if(list.length){
						html+='<div class="members"><div class="members-head"><em class="members-title">methods:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
									'<div class="member-expand">&nbsp;</div>' +
									'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
									'<div class="member-title"><strong>'+list[i].name+'</strong>( ';
							var paramsList=[];
							for(var p=0; p<list[i].params.length; ++p){
								var paramStr=list[i].params[p].dataType+' <span class="pre">'+list[i].params[p].name+'</span>';
								if(list[i].params[p].optional)
									paramStr='['+paramStr+']';
								paramsList.push(paramStr);
							}
							html+=paramsList.join(', ');
							html+=' ) : '+(list[i].returns.type||'void');
							if(!$.isEmptyObject(list[i].flags)){
								var flags=[];
								for(var f in list[i].flags)
									if(list[i].flags[f])
										flags.push(f);
								if(flags.length){
									html+=' [';
									for(var f=0; f<flags.length; ++f)
										html+='<span class="method-flag">'+flags[f]+'</span>';
									html+=']';
								}
							}
							html+='</div>' +
									'<div class="member-summary">'+(list[i].summary || list[i].description)+'</div>'+
									'<div class="member-description"><div>'+(list[i].description||list[i].summary)+'</div>';
							// add Parameters and Returns (if any) to member-description 
							if(paramsList.length){
								html+='Parameters:<ul>';
								for(var p=0; p<list[i].params.length; ++p){
									html+='<li><span class="pre">'+list[i].params[p].name+'</span> : '+list[i].params[p].dataType+'<div>';
									if(list[i].params[p].optional)
										html+='(optional) ';
									html+=(list[i].params[p].description)+'</div></li>'; // ||list[i].params[p].summary
								}
								html+='</ul>';
							}
							if(list[i].returns.type!='void'){
								html+='Returns:<ul>';
								html+='<li><span class="pre">'+list[i].returns.type+'</span><div>'+list[i].returns.summary+'</div></li>';
								html+='</ul>';
							}
							html+='</div></div>';
						}
						html+='</div>';
					}
				}
				// events
				if('events' in obj){
					list=getMembersList('events');
					if(list.length){
						html+='<div class="members"><div class="members-head"><em class="members-title">events:</em><div class="defined-by">defined by</div></div>';
						for(var i=0; i<list.length; ++i){
							html+='<div class="member">' +
									'<div class="member-expand">&nbsp;</div>' +
									'<div class="member-meta"><div class="defining-class obj-link" ns-path="'+list[i].definingClass+'">'+list[i].definingClass+'</div></div>' +
									'<div class="member-title"><strong>'+list[i].name+'</strong>( ';
							var paramsString=[];
							for(var p=0; p<list[i].params.length; ++p)
								paramsString.push(list[i].params[p].dataType+' <span class="pre">'+list[i].params[p].name+'</span>');
							html+=paramsString.join(', ');
							html+=' )</div>' +
									'<div class="member-summary">'+(list[i].summary || list[i].description)+'</div>' +
									'<div class="member-description"><div>'+(list[i].description || list[i].summary)+'</div>';
							// add Parameters (if any) to member-description 
							if(paramsString.length){
								html+='Parameters:<ul>';
								for(var p=0; p<list[i].params.length; ++p)
									html+='<li><span class="pre">'+list[i].params[p].name+'</span> : '+list[i].params[p].dataType+'<div>'+(list[i].params[p].description)+'</div></li>';
								html+='</ul>';
							}
							html+='</div></div>';
						}
						html+='</div>';
					}
				}
				
				$('#selectionInfo').html(html);
				
			    /**
			     * @event renderSelectedItemInfo
			     * Fires when the details of the selected item are rendered in the selectionInfo pane.
			     * @param {Documentor.Api} this
			     * @param {Object} item	The rendered item's data.
			     */
				renderer.emit('renderSelectedItemInfo', this, obj);
			}

			/**
			 * @cfg	{String/jQuery}	containerSelector	A container to limit the global listeners' scope. 
			 */
			var containerSelector=this.containerSelector||document;
			if(!this.hasAttachedListeners){
				$(containerSelector).on('click', '.hide-inherited', function (){
					storage.hideInherited=this.checked;
					renderObj(storage.obj);
				});
				$(containerSelector).on('click', '.obj-link', function (){
					location.hash=$(this).attr('ns-path');
		//				renderObj(api.getNSObject($(this).attr('ns-path')));
				});
				$(containerSelector).on('click', '.member-expand', function (){
					$(this).parent().toggleClass('expanded');
				});

				$(window).bind( 'hashchange', renderObjectFromHash);
				$(window).bind('resize', function (){
					$('#selectionInfoWrap, #apiTreeWrap', containerSelector).height($(window).height()-10);
				});
				this.hasAttachedListeners=true;
			}
			
			function renderObjectFromHash(){
				$('.object-title.active', containerSelector).removeClass('active');
				var obj=api.getNSObject(location.hash.substring(1));
				if(obj){
					$('.object-title[ns-path="'+obj.name+'"]', containerSelector).addClass('active');
					renderObj(obj);
				}
			}
			$(window).trigger('resize');
			(function (){
				// run through all classes and compile their "subclasses"
				function processObj(obj){
					if(obj.type=='class' && obj['extends']){
						var extObj=api.getNSObject(obj['extends']);
						if(extObj){
							if(!extObj.subclasses)
								extObj.subclasses=[];
							extObj.subclasses.push(obj);
						}
					}
					if(obj.children)
						for(var c in obj.children)
							processObj(obj.children[c]);
				}
				processObj(api.ns);
			}());
				
			if(location.hash!='')
				renderObjectFromHash();
		}
	});
	
}());
