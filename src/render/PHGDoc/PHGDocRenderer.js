
(function (){
	
	var ns, util, docRenderer;
	
	if(typeof module == 'object' && module.exports){
		util=require('../../../lib/util');
		ns=module.exports;
		docRenderer=require('../DocumentationRenderer').DocumentationRenderer;
	}else{
		util=window.util;
		ns=util.ns('Documentor.render');
		docRenderer=ns.DocumentationRenderer;
	}
	
	/**
	 * TO-DO: add search facility
	 * TO-DO: move "live" JS code to a separate include so that it can be used in generated static HTML documentation.
	 * TO-DO: add "Descendent Classes" list to the class description head.
	 */

	/**
	 * @class Documentor.render.PHGDocRenderer
	 * @extends Documentor.render.DocumentationRenderer
	 * @constructor
	 * Renders the documentaion tree.
	 */
	ns.PHGDocRenderer=function (cfg){
		ns.PHGDocRenderer.super_.apply(this, arguments);
	};
	util.inherits(ns.PHGDocRenderer, docRenderer);
	util.extend(ns.PHGDocRenderer.prototype, {
		/**
		 * @cfg {String}	exportFile (optional)	Write the generated content into a file a instead of the current web page.
		 */
		initialize:function (){
			if(this.api)
				this.render(this.api);
		},
		render:function (api){
			if('exportPath' in this){
				var fs=require('fs'),
					path=require('path'),
					docPath=path.resolve(this.exportPath);
				function copyResourceFileIf(fileName){
					var targetName=path.resolve(docPath, 'resources', fileName);
					fs.stat(targetName, function (err, stats){
						if(err){ // if it does not exist then copy it over from "resources"
							var resFolder=path.resolve(__dirname, 'resources'),
								targetResFolder=path.dirname(targetName); 
							if(!path.existsSync(targetResFolder))
								fs.mkdirSync(targetResFolder);
							require('util').pump(
								fs.createReadStream(path.resolve(resFolder, fileName)),
								fs.createWriteStream(targetName, {flags:'w'})
							);
						}
					});
				}
				['jquery-1.4.3.min.js', 'PHGDoc.css', 'images/expanded.png', 'images/collapsed.png', 'images/arrow_end.gif'].forEach(copyResourceFileIf);
//				copyResourceFileIf('jquery-1.4.3.min.js');
//				copyResourceFileIf('PHGDoc.css');
				/**
				 * TO-DO: copy files from /resources/images too
				 */
				var file=fs.createWriteStream(path.resolve(docPath, 'index.html'), { flags: 'w'});
				file.on('error', function (err) {
					console.log(err);
				});
				file.write('<!DOCTYPE html>' +
						'<html>' +
						'<head>' +
						'<title>'+api.ns.name+'</title>' +
						'<meta charset="utf-8">' +
						'<script type="text/javascript" src="resources/jquery-1.4.3.min.js"></script>' +
						'<link rel="stylesheet" href="resources/PHGDoc.css" type="text/css">' +
						'<script type="text/javascript">');
				file.write(renderer.toString());
				file.write('var api='+JSON.stringify({ns:api.ns})+';');
				file.write('api.NSPathSeparator=\''+api.NSPathSeparator+'\';');
				file.write('api.getNSObject='+api.getNSObject.toString()+';');
				file.write('$(document).ready(function (){ '+renderer.name+'(api); });');
				file.write('</script>' +
						'</head>' +
						'<body>' +
						'</body>' +
						'</html>');
								
			}else
				renderer(api);
		}
	});
	function renderer(api){
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
		$('body').append('<table width="100%"><tr><td id="apiTree" width="30%" valign="top">'+printNS(api.ns)+'</td><td id="selectionInfo" valign="top"></td></tr></table>');
		var storage={
			hideInherited:false
		};
		$('.hide-inherited').live('click', function (){
			storage.hideInherited=this.checked;
			renderObj(storage.obj);
		});
		function renderObj(obj){
			storage.obj=obj;
			var hierarchy=[[obj.name, obj]],
				html='',
				list;
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
				html+='<div class="hierarchy"><em>hierarchy:</em> <div class="hierarchy-item"><div class="hierarchy-item-title'+(cls[1]?(' obj-link" ns-path="'+cls[0]+'"'):'"')+'>'+cls[0]+'</div>';
				var ending='<div class="hierarchy-item hierarchy-sub-item"><div class="hierarchy-item-title">'+hierarchy[hierarchy.length-1][0]+'</div></div>' +
						'</div></div>';
				for(var i=1; i<hierarchy.length-1; i++){
					html+='<div class="hierarchy-item hierarchy-sub-item"><div class="hierarchy-item-title'+(hierarchy[i][1]?(' obj-link" ns-path="'+hierarchy[i][0]+'"'):'"')+'>'+hierarchy[i][0]+'</div>';
					ending+='</div>';
				}
				html+=ending;
			}
			html+='<div>'+(obj.type!='api'?obj.type:'')+' <strong>'+obj.name+'</strong>';
			if(!$.isEmptyObject(obj.flags)){
				var flags=[];
				for(var f in obj.flags)
					if(obj.flags[f])
						flags.push(f);
				if(flags.length)
					html+='<div><span class="object-attributes">( '+flags.join()+' )</span></div>';
			}
			if('definedIn' in obj)
				html+='<div>defined in: '+obj.definedIn.split('/').pop()+'</div>';
			if(obj.description)
				html+='<p>'+obj.description+'</p>';
			html+='</div>';
			html+='<div class="clear">';
			if(obj.type=='class')
				html+='<input type="checkbox"'+(storage.hideInherited?' checked':'')+' class="hide-inherited"> hide inherited';
			html+='</div>';
			
			/**
			 * TO-DO: add a check to each member block to determine if it needs to be expandable
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
		}
		$('.obj-link').live('click', function (){
			location.hash=$(this).attr('ns-path');
//				renderObj(api.getNSObject($(this).attr('ns-path')));
		});
		$('.member-expand').live('click', function (){
			$(this).parent().toggleClass('expanded');
		});
		
		function renderObjectFromHash(){
			$('.object-title.active').removeClass('active');
			var obj=api.getNSObject(location.hash.substring(1));
			if(obj){
				$('.object-title[ns-path='+obj.name+']').addClass('active');
				renderObj(obj);
			}
		}
		if(location.hash!='')
			renderObjectFromHash();
		$(window).bind( 'hashchange', renderObjectFromHash);
	}
	
}());
