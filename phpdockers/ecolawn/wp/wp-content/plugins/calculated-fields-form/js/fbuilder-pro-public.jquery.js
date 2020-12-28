	$.fbuilder[ 'controls' ] = ( typeof $.fbuilder[ 'controls' ] != 'undefined' ) ? $.fbuilder[ 'controls' ]: {};
	$.fbuilder[ 'forms' ] = ( typeof $.fbuilder[ 'forms' ] != 'undefined' ) ? $.fbuilder[ 'forms' ]: {};

	$.fbuilder[ 'htmlEncode' ] = function(value)
	{
		value = $('<div/>').text(value).html()
		value = value.replace(/"/g, "&quot;")
					 .replace(/&amp;lt;/g, '&lt;')
					 .replace(/&amp;gt;/g, '&gt;');
		return value;
	};

	$.fbuilder[ 'htmlDecode' ] = function(value)
	{
		if( /&(?:#x[a-f0-9]+|#[0-9]+|[a-z0-9]+);?/ig.test( value ) ) value = $( '<div/>' ).html( value ).text();
		return value;
	};

	$.fbuilder[ 'escape_symbol' ] = function( value ) // Escape the symbols used in regulars expressions
	{
		return value.replace(/([\^\$\-\.\,\[\]\(\)\/\\\*\?\+\!\{\}])/g, "\\$1");
	};

	$.fbuilder[ 'parseValStr' ] = function( value, raw )
	{
		raw = raw || false;
		if( typeof value == 'undefined' || value == null ) value = '';
		/* value = $.trim( value.replace(/'/g, "\\'").replace( /\$/g, '\\$').replace(/"/g, '\\"') ); */
		value = $.trim( value.replace(/\\/g, "\\\\") ).replace(/'/g, "\\'").replace(/"/g, '\\"');
		return ($.isNumeric(value)) ? ((raw) ? value : value*1) : '"' + value + '"';
	};

	$.fbuilder[ 'parseVal' ] = function( value, thousandSeparator, decimalSymbol )
	{
		if( typeof value == 'undefined' || value == null || value == '' ) return 0;
		value = $.trim(value);

		/* Check if date */
		if(/(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{4})|(\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2})/.test(value))
			return $.fbuilder[ 'parseValStr' ]( value );

		/* Managing the value basically as number */
		thousandSeparator = $.fbuilder.escape_symbol( ( typeof thousandSeparator == 'undefined' ) ? ',' : thousandSeparator );
		decimalSymbol = ( typeof decimalSymbol == 'undefined' || /^\s*$/.test( decimalSymbol ) ) ? '.' : decimalSymbol;
		var correction = new RegExp( ( ( /^\s*$/.test( thousandSeparator ) ) ? ',' : thousandSeparator )+('\(\\d{1,2}\)$') ),
			correctionReplacement = decimalSymbol+'$1';

		thousandSeparator = new RegExp( thousandSeparator, 'g' );
		decimalSymbol = new RegExp( $.fbuilder.escape_symbol( decimalSymbol ), 'g' );

		var t = value.replace( correction, correctionReplacement )
					.replace( thousandSeparator, '' )
					.replace( decimalSymbol, '.' )
					.replace( /\s/g, '' ),
			p = /[+\-]?((\d+(\.\d+)?)|(\.\d+))(?:[eE][+\-]?\d+)?/.exec( t );

		return ( p ) ? ((/^0\d/.test(p[0])) ? p[0].substr(1) : p[0])*1 : $.fbuilder[ 'parseValStr' ]( value );
	};


	$.fn.fbuilder = function(options){
		var opt = $.extend({},
					{
						pub:false,
						identifier:"",
						title:""
					},options, true);

		opt.messages = $.extend({
					previous: "Previous",
					next: "Next",
					pageof: "Page {0} of {0}",
					required: "This field is required.",
					email: "Please enter a valid email address.",
					datemmddyyyy: "Please enter a valid date with this format(mm/dd/yyyy)",
					dateddmmyyyy: "Please enter a valid date with this format(dd/mm/yyyy)",
					number: "Please enter a valid number.",
					digits: "Please enter only digits.",
					maxlength: "Please enter no more than {0} characters.",
                    minlength: "Please enter at least {0} characters.",
                    equalTo: "Please enter the same value again.",
					max: "Please enter a value less than or equal to {0}.",
					min: "Please enter a value greater than or equal to {0}.",
					currency: "Please enter a valid currency value."
			},opt.messages);

		opt.messages.max = $.validator.format(opt.messages.max);
		opt.messages.min = $.validator.format(opt.messages.min);
		opt.messages.maxlength = $.validator.format(opt.messages.maxlength);
		opt.messages.minlength = $.validator.format(opt.messages.minlength);

		$.extend($.validator.messages, opt.messages);

		$("#cp_calculatedfieldsf_pform"+fnum).validate({
			ignore:".ignore,.ignorepb",
			errorElement: "div",
			errorPlacement: function(e, element)
				{
					var _parent = element.closest( '.dfield' ),
						_uh =  _parent.find( 'span.uh:visible' );

					if( _uh.length )
						e.appendTo( _uh );
					else
						e.insertAfter( _parent );

					e.addClass( 'message' )
					 .css( 'position', 'absolute' );
				}
		}).messages = opt.messages;

		var items = [],
			reloadItemsPublic = function()
			{
				var form_tag = $("#fieldlist"+opt.identifier).closest( 'form' );
				form_tag.addClass( theForm.formtemplate );
				if( !opt.cached )
				{
					$("#fieldlist"+opt.identifier).html("").addClass(theForm.formlayout);
					$("#formheader"+opt.identifier).html(theForm.show());

					var page = 0;
					$("#fieldlist"+opt.identifier).append('<div class="pb'+page+' pbreak" page="'+page+'"></div>');
					for (var i=0;i<items.length;i++)
					{
						items[i].index = i;
						if (items[i].ftype=="fPageBreak")
						{
							page++;
							$("#fieldlist"+opt.identifier).append('<div class="pb'+page+' pbreak" page="'+page+'"></div>');
						}
						else
						{
							$("#fieldlist"+opt.identifier+" .pb"+page).append(items[i].show());
							if (items[i].predefinedClick)
							{
								$("#fieldlist"+opt.identifier+" .pb"+page).find("#"+items[i].name).attr("placeholder",items[i].predefined);
								$("#fieldlist"+opt.identifier+" .pb"+page).find("#"+items[i].name).attr("value","");
							}
							if (items[i].userhelpTooltip)
							{
								var uh_t,uh = $("#fieldlist"+opt.identifier+" .pb"+page).find('[id*="'+items[i].name+'"]').closest(".dfield");
								if( uh.length == 0 )
								{
									uh = $("#fieldlist"+opt.identifier+" .pb"+page).find('[id*="'+items[i].name+'"]').closest(".fields");
								}
								uh_t = uh.find(".uh");
								if(uh_t.length && uh_t.html()!="")
								{
									uh.attr("uh",uh_t.html());
									uh_t.html("");
								}
							}
						}
					}
                }
				else
				{
					var page = form_tag.find( '.pbreak' ).length,
						i	 = items.length;
				}

				if (page>0)
				{
					if( !opt.cached ) // Check if the form is cached
					{
						$("#fieldlist"+opt.identifier+" .pb"+page).addClass("pbEnd");
						$("#fieldlist"+opt.identifier+" .pbreak").each(function(index) {
							var code = $(this).html();
							var bSubmit = '';

							if (index == page)
							{
								if ( $( "#cpcaptchalayer"+opt.identifier ).length && !/^\s*$/.test( $( "#cpcaptchalayer"+opt.identifier ).html() ) )
								{
									code += '<div class="captcha">'+$("#cpcaptchalayer"+opt.identifier).html()+'</div><div class="clearer"></div>';
									$("#cpcaptchalayer"+opt.identifier).html("");
								}
								if ($("#cp_subbtn"+opt.identifier).html())
								{
									bSubmit = '<div class="pbSubmit" tabindex="0">'+$("#cp_subbtn"+opt.identifier).html()+'</div>';
								}
							}
							$(this).html('<fieldset><legend>'+opt.messages.pageof.replace( /\{\s*\d+\s*\}/, (index+1) ).replace( /\{\s*\d+\s*\}/, (page+1) )+'</legend>'+code+'<div class="pbPrevious" tabindex="0">'+opt.messages.previous+'</div><div class="pbNext" tabindex="0">'+opt.messages.next+'</div>'+bSubmit+'<div class="clearer"></div></fieldset>');
						});
					}

					$( '#fieldlist'+opt.identifier).find(".pbPrevious,.pbNext").bind("keyup", function(evt){
						if(evt.which == 13 || evt.which == 32) $(this).click();
					}).bind("click", {'identifier' : opt.identifier}, function(evt){
						var _pg	  = $(this).closest('.pbreak'),
							_from = _pg.attr('page')*1,
							_inc  = ($(this).hasClass("pbPrevious")) ? -1 : 1,
							_to   = _from+_inc,
							_p;

						_p = $.fbuilder['goToPage'](
							{
								'formIdentifier' : evt.data.identifier,
								'from'			 : _from,
								'to'			 : _to
							}
						);
						if(_p == _to) $.fbuilder.setBrowserHistory();
						if($('.pb'+_p).find('.fields:visible').length == 0)
							if(_inc == -1 && 0 < _p) $('.pb'+_p).find('.pbPrevious').click();
							else if(_p < _pg.siblings('.pbreak').length) $('.pb'+_p).find('.pbNext').click();
					    return false;
					});
                }
				else
				{
					if( !opt.cached )
					{
						if ( $( "#cpcaptchalayer"+opt.identifier ).length && !/^\s*$/.test( $( "#cpcaptchalayer"+opt.identifier ).html() ) )
						{
							$("#fieldlist"+opt.identifier+" .pb"+page).append('<div class="captcha">'+$("#cpcaptchalayer"+opt.identifier).html()+'</div>');
							$("#cpcaptchalayer"+opt.identifier).html("");
						}
						if ($("#cp_subbtn"+opt.identifier).html())
						{
							$("#fieldlist"+opt.identifier+" .pb"+page).append('<div class="pbSubmit" tabindex="0">'+$("#cp_subbtn"+opt.identifier).html()+'</div>');
						}
					}
				}

				if( !opt.cached && opt.setCache)
				{
					// Set Cache
					var url  = document.location.href,
						data = {
							'cffaction' : 'cff_cache',
							'cache'	 : form_tag.html().replace( /\n+/g, '' ),
							'form'	 : form_tag.find( '[name="cp_calculatedfieldsf_id"]').val()
						};
					$.post( url, data, function( data ){ if(typeof console != 'undefined' )console.log( data ); } );
				}

                // Set Captcha Event
				$( document ).on( 'click', '#fbuilder .captcha img', function(){ var e = $( this ); e.attr( 'src', e.attr( 'src' ).replace( /&\d+$/, '' ) + '&' + Math.floor( Math.random()*1000 ) ); } );
				$( form_tag ).find( '.captcha img' ).click();

				$( '#fieldlist'+opt.identifier).find(".pbSubmit").bind("keyup", function(evt){
					if(evt.which == 13 || evt.which == 32) $(this).click();
				}).bind("click", { 'identifier' : opt.identifier }, function(evt){
					$(this).closest("form").submit();
				});

				if (i>0)
				{
                    theForm.after_show( opt.identifier );
					for (var i=0;i<items.length;i++)
					{
						items[i].after_show();
					}

					$(document).on(
						'change',
						'#fieldlist'+opt.identifier+' .depItemSel,'+'#fieldlist'+opt.identifier+' .depItem',
						{ 'identifier' : opt.identifier },
						function( evt )
						{
							$.fbuilder.showHideDep(
								{
									'formIdentifier' : evt.data.identifier,
									'fieldItentifier': evt.target.id
								}
							);
						}
					);

					$.fbuilder.showHideDep(
						{
							'formIdentifier' : opt.identifier
						}
					);

					try
					{
						$.widget.bridge('uitooltip', $.ui.tooltip);
						$( "#fbuilder"+opt.identifier ).uitooltip({show: false,hide:false,tooltipClass:"uh-tooltip",position: { my: "left top", at: "left bottom+5", collision: "none"  },items: "[uh]",content: function (){return $(this).attr("uh");}, open: function( evt, ui ){ try{ if(window.matchMedia("screen and (max-width: 640px)").matches){
							var duration = ('undefined' != typeof tooltip_duration && /^\d+$/.test(tooltip_duration)) ? tooltip_duration : 3000;
							setTimeout( function(){$(ui.tooltip).hide('fade'); }, duration);
						}}catch( err ){}} });
					} catch(e){}
                }
                $("#fieldlist"+opt.identifier+" .pbreak:not(.pb0)").find(".field").addClass("ignorepb");
			};

		var fform=function(){};
		$.extend(fform.prototype,
			{
				title:"Untitled Form",
				description:"This is my form. Please fill it out. It's awesome!",
				formlayout:"top_aligned",
				formtemplate:"",
                evalequations:1,
                evalequationsevent:2,
                autocomplete:1,
				show:function(){
                    return '<div class="fform" id="field"><h2>'+this.title+'</h2><span>'+this.description+'</span></div>';
				},
                after_show:function( id ){
					var form = $( '#cp_calculatedfieldsf_pform'+id );

					if(typeof $.fn.fbuilder_localstorage != 'undefined' && form.hasClass('persist-form'))
					{
						form.fbuilder_localstorage();
					}

                    form.attr( 'data-evalequations', this.evalequations )
						.attr( 'data-evalequationsevent', this.evalequationsevent )
						.attr( 'autocomplete', ( ( this.autocomplete ) ? 'on' : 'off' ) )
						.find( 'input,select' )
						.blur( function(){ try{ $(this).valid(); }catch(e){};} );
					if(!this.autocomplete) form.find('input[name*="fieldname"]').attr('autocomplete', 'new-password');
                }
			});

		//var theForm = new fform(),
		var theForm,
			ffunct = {
				toShow : {},
				toHide : {},
				hiddenByContainer : {},
				getItem: function( name )
					{
						var regExp = new RegExp((parseInt(name,10) == name) ? 'fieldname'+name+'_' : name+'_', i);
						for( var i in items )
						{
							if( items[ i ].name == name || regExp.test(items[ i ].name))
							{
								return items[ i ];
							}
						}
						return false;
					},
				getItems: function()
					{
					   return items;
					},
				loadData:function(f)
					{
						var d =  window[ f ];
						if ( typeof d != 'undefined' )
						{
							if( typeof d == 'object' && ( typeof d.nodeType !== 'undefined' || d instanceof jQuery ) ){ d = jQuery.parseJSON( jQuery(d).val() ); }
							else if( typeof d == 'string' ){ d = jQuery.parseJSON( d ); }

							if (d.length == 2)
							{
							   this.formId = d[ 1 ][ 'formid' ];
							   items = [];
							   for (var i=0;i<d[0].length;i++)
							   {
								   var obj = new $.fbuilder.controls[d[0][i].ftype]();
								   obj = $.extend(true, {}, obj,d[0][i]);
								   obj.name = obj.name+opt.identifier;
								   obj.form_identifier = opt.identifier;
								   obj.init();
								   items[items.length] = obj;
							   }
							   theForm = new fform();
							   theForm = $.extend(theForm,d[1][0]);

							   opt.cached   = (typeof d[ 1 ][ 'cached' ] != 'undefined' && d[ 1 ][ 'cached' ] ) ? true : false;
							   opt.setCache = (!this.cached && typeof d[ 1 ][ 'setCache' ] != 'undefined' && d[ 1 ][ 'setCache' ]) ? true : false;

							   reloadItemsPublic();
						    }
						    $.fbuilder.cpcff_load_defaults( opt );
						}
					}
			};

		$.fbuilder[ 'forms' ][ opt.identifier ] = ffunct;
	    this.fBuild = ffunct;
	    return this;
	}; // End fbuilder plugin

	$.fbuilder[ 'showSettings' ] = {
		formlayoutList : [{id:"top_aligned",name:"Top Aligned"},{id:"left_aligned",name:"Left Aligned"},{id:"right_aligned",name:"Right Aligned"}]
	};

	$.fbuilder.controls[ 'ffields' ] = function(){};
	$.extend($.fbuilder.controls[ 'ffields' ].prototype,
		{
				form_identifier:"",
				name:"",
				shortlabel:"",
				index:-1,
				ftype:"",
				userhelp:"",
				userhelpTooltip:false,
				csslayout:"",
				init:function(){},
				_getAttr:function(attr)
					{
						var me = this, f, v = $.trim(me[attr]);
						if($.isNumeric(v)) return parseFloat(v);
						f = (/^fieldname\d+$/i.test(v)) ? me.getField(v) : false;
						if(f)
						{
							v = f.val();
							if(f.ftype == 'fdate') return new Date(v*86400000);
							if($.isNumeric(v)) return parseFloat(v);
							return v.replace(/^"+/, '').replace(/"+$/, '');
						}
						return v;
					},
				_setHndl:function(attr, one)
					{
						var me = this, v = $.trim(me[attr]);
						if($.isNumeric(v)) return;
						var s = (/^fieldname\d+$/i.test(v)) ? '[id*="'+v+me.form_identifier+'"]' : v,
							i = (one) ? 'one' : 'on';
						if('string' == typeof s && !/^\s*$/.test(s))
						{
							s = $.trim(s);
							if(!$.isNumeric(s.charAt(0)))
							{
								$(document)[i]('change depEvent', s, function(evt){
									if(me['set_'+attr]) me['set_'+attr](me._getAttr(attr), $(evt.target).hasClass('ignore'));
								});
							}
						}
					},
				getField: function(f){return $.fbuilder['forms'][this.form_identifier].getItem(f);},
				jQueryRef: function(){return $('.'+this.name);},
				show:function()
					{
						return 'Not available yet';
					},
				after_show:function(){},
				val:function(raw){
					raw = raw || false;
					var e = $( "[id='" + this.name + "']:not(.ignore)" );
					if( e.length )
					{
						var v = e.val();
						if(raw) return $.fbuilder.parseValStr(v, raw);

						v = $.trim(v);
						return ($.isNumeric(v)) ? $.fbuilder.parseVal(v) : $.fbuilder.parseValStr(v);
					}
					return 0;
				},
				setVal:function( v )
				{
					$( "[id='" + this.name + "']" ).val( v ).change();
				}
		});

	$.fbuilder[ 'setBrowserHistory' ] = function(replace)
	{
		if('history' in window)
		{
			var bookmark = '#',
				separator = '';
			for(var formId in $.fbuilder.forms)
			{
				bookmark += separator+'f'+formId.replace(/[^\d]/g,'')+'p'+($.fbuilder.forms[formId]['currentPage'] || 0);
				separator = '|';
			}
			history[(replace) ? 'replaceState' : 'pushState']({}, document.title, bookmark);
		}
	}; // End setBrowserHistory

	$.fbuilder[ 'manageHistory' ] = function(state)
	{
		var bookmark = (document.URL.split('#').length > 1) ? document.URL.split('#')[1] : null,
			_match, _form, _to, setHistoryEntry = false;

		if(bookmark)
		{
			while(_match = bookmark.match(/f(\d+)p(\d+)\|?/))
			{
				_form = '_'+_match[1];
				_to   = _match[2]*1;
				bookmark = bookmark.replace(_match[0],'');

				if(!(_form in $.fbuilder.forms)){setHistoryEntry = true; continue;}
				if('currentPage' in $.fbuilder.forms[_form]) continue;
				if(
					!$('#'+$.fbuilder.forms[_form].formId).hasClass('persist-form') ||
					_to != $.fbuilder['goToPage'](
						{
							'formIdentifier' : _form,
							'from' 			 : 0,
							'to'			 : _to
						}
					)
				) setHistoryEntry = true;
			}
		}
		else
		{
			for(_form in $.fbuilder.forms)
			{
				if('currentPage' in $.fbuilder.forms[_form])
					$.fbuilder['goToPage'](
						{
							'formIdentifier' : _form,'from' : 0, 'to' : 0
						}
					);
			}
		}
		if(setHistoryEntry) $.fbuilder.setBrowserHistory(true);
	}; // End manageHistory

	$.fbuilder[ 'goToPage' ] = function( config )
	{
		if(
			('formIdentifier' in config || 'form' in config) &&
			'to' in config
		)
		{
			var identifier 	= (config['form']) ?  $('[name="cp_calculatedfieldsf_pform_psequence"]', config['form']).val() : config['formIdentifier'],
				formObj 	= $.fbuilder.forms[identifier],
				_from		= (('from' in config) ? config['from'] : (('currentPage' in formObj) ? formObj['currentPage'] : 0))*1,
				_to			= config['to']*1,
				direction  	= (_from < _to) ? 1 : -1,
				formDom		= $('[id="'+formObj.formId+'"]'),
				pageDom, i  = _from;

			while(i != _to)
			{
				$(".pbreak:not(.pb"+i+")",formDom).find(".field").addClass("ignorepb");
				$(".pb"+i,formDom).find(".field").removeClass("ignorepb");
				if(direction == 1 && !formDom.valid()) break;
				i += direction;
			}
			formObj['currentPage'] = i;
			$(".pbreak:not(.pb"+i+")",formDom).hide().find(".field").addClass("ignorepb");
			pageDom = $(".pbreak.pb"+i,formDom);
			pageDom.show().find(".field").removeClass("ignorepb");

			if(i == _to)
			{
				if ($(".fields",pageDom).length>0)
				{
					try
					{
						var ffocusable  = pageDom.find(":focusable"),
							_wScrollTop = $(window).scrollTop(),
							_viewportHeight = $(window).height(),
							_scrollTop  = formDom.offset().top;

						if(
							ffocusable.length &&
							!ffocusable.first().hasClass('hasDatepicker') &&
							ffocusable.first().closest('[uh]').length == 0 /* FIXES AUTO-OPEN TOOLTIPS */
						) ffocusable[0].focus();

						if(_scrollTop < _wScrollTop || (_wScrollTop+_viewportHeight)<_scrollTop )
							$( 'html, body' ).animate({scrollTop:  _scrollTop}, 50);
					}
					catch(e){}
				}
			}
			else
			{
				formDom.validate().focusInvalid();
			}
			return i;
		}
	}; // End goToPage

	$.fbuilder[ 'showHideDep' ] = function( config )
	{
		/**
		 * If isNotFirstTime is defined, the equations associated to the fields should be inserted in the queue of equations
		 */
		var process_items = function( items, isNotFirstTime )
		{
			for( var i = 0, h = items.length; i < h; i++ )
			{
				if( typeof items[ i ] == 'string' ) items[i] = $.fbuilder[ 'forms' ][ identifier ].getItem( items[i] );
				if(isNotFirstTime && items[i])
				{
					$('[name="'+items[i].name+'"]').trigger('depEvent');
					if(items[i].usedInEquations ) $.fbuilder[ 'calculator' ].enqueueEquation( identifier, items[i].usedInEquations );
				}
				if( typeof items[ i ][ 'showHideDep' ] != 'undefined' )
				{
					var list = items[ i ][ 'showHideDep' ]( toShow, toHide, hiddenByContainer );
					if( typeof list != 'undefined' && list.length )
						process_items( list, true );
				}
			}
		};

		if('formIdentifier' in config)
		{
			var identifier = config[ 'formIdentifier' ];

			if( typeof  $.fbuilder[ 'forms' ][ identifier ] != 'undefined' )
			{
				var toShow = $.fbuilder[ 'forms' ][ identifier ][ 'toShow' ],
					toHide = $.fbuilder[ 'forms' ][ identifier ][ 'toHide' ],
					hiddenByContainer = $.fbuilder[ 'forms' ][ identifier ][ 'hiddenByContainer' ],
					items = ('fieldItentifier' in config) ? [ $.fbuilder[ 'forms' ][ identifier ].getItem(config[ 'fieldItentifier' ].replace(/_[cr]b\d+$/i, '')) ] : $.fbuilder[ 'forms' ][ identifier ].getItems();

				process_items( items );
				$( document ).trigger( 'showHideDepEvent', $.fbuilder[ 'forms' ][ identifier ][ 'formId' ] );
			}
		}
	}; // End showHideDep

	// Load default values
	$.fbuilder[ 'cpcff_load_defaults' ] = function( o )
	{
		var $ = fbuilderjQuery,
			id,
			item,
			form_data,
			form_obj;

		if( typeof cpcff_default != 'undefined' )
		{
			id = o.identifier.replace( /[^\d]/g, '' );
			if( typeof cpcff_default[ id ] != 'undefined' )
			{
				form_data 	= cpcff_default[ id ];
				id 			= '_'+id;
				form_obj  	= $.fbuilder[ 'forms' ][ id ];

				for( var field_id in form_data )
				{
					item = form_obj.getItem( field_id+id );
					try{ if( typeof item[ 'setVal' ] != 'undefined' ) item.setVal( form_data[ field_id ] ); }
					catch(err){}
				}

				$.fbuilder.showHideDep(
					{
						'formIdentifier' : o.identifier
					}
				);
			}
		}
	};

	// Read history
	window.addEventListener('popstate', function(){
		try
		{
			// Solves an issue with the datepicker if it is opened and back/next buttons in browser are pressed
			$(".ui-datepicker").hide();
			$.fbuilder.manageHistory();
		}
		catch(err){}
	});

	$(window).on('load', function(){
		$.fbuilder.manageHistory();
	});