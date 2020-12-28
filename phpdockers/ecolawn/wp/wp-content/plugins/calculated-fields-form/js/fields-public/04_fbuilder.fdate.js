	$.fbuilder.controls[ 'fdate' ] = function(){};
	$.extend(
		$.fbuilder.controls[ 'fdate' ].prototype,
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Date",
			ftype:"fdate",
			predefined:"",
			predefinedClick:false,
			size:"medium",
			required:false,
			dformat:"mm/dd/yyyy",
			dseparator:"/",
			tformat:"24",
			showDropdown:false,
			dropdownRange:"-10:+10",
			minDate:"",
			maxDate:"",
            invalidDates:"",
			minHour:0,
			maxHour:23,
			minMinute:0,
			maxMinute:59,

			stepHour: 1,
			stepMinute: 1,

			showDatepicker: true,
			showTimepicker: false,

			ariaHourLabel: 'hours',
			ariaMinuteLabel: 'minutes',
			ariaAMPMLabel: 'am or pm',

			defaultDate:"",
			defaultTime:"",
			working_dates:[true,true,true,true,true,true,true],

			_set_Events : function()
				{
					var me = this,
						f  = function(){
							$( '#'+me.name+'_date' ).valid();
							me.set_dateTime();
						};

					$( document ).on( 'change', '#'+me.name+'_date', 	function(){ f(); } );
					$( document ).on( 'change', '#'+me.name+'_hours',   function(){ f(); } );
					$( document ).on( 'change', '#'+me.name+'_minutes', function(){ f(); } );
					$( document ).on( 'change', '#'+me.name+'_ampm', 	function(){ f(); } );

					$( '#cp_calculatedfieldsf_pform'+me.form_identifier ).bind( 'reset', function(){ setTimeout( function(){ me.set_DefaultDate(); me.set_DefaultTime(); me.set_dateTime(); }, 500 ); } );
				},
			_validateDate: function( d, w, i )
				{
					try{
						if( d === null || !w[ d.getDay()] ) return false;
						if( i !== null )
						{
							for( var j = 0, h = i.length; j < h; j++ )
							{
								if( d.getDate() == i[ j ].getDate() && d.getMonth() == i[ j ].getMonth() && d.getFullYear() == i[ j ].getFullYear() ) return false;
							}
						}
					}
					catch( _err ){}
					return true;
				},
			_validateTime : function( e, i )
				{
					if( i.showTimepicker )
					{
						var base = e.name.replace( '_date', '' ),
							h = $('#'+base+'_hours').val(),
							m = $('#'+base+'_minutes').val();
						if( i.tformat == 12 )
						{
							if( $('#'+base+'_ampm').val() == 'pm' && h != 12 ) h = h*1 + 12;
							if( $('#'+base+'_ampm').val() == 'am' && h == 12 ) h = 0;
						}
						if(
							h < i.minHour ||
							i.maxHour < h ||
							(h == i.minHour && m < i.minMinute) ||
							(h == i.maxHour && i.maxMinute < m)
						) return false;
					}
					return true;
				},
			init:function()
				{
					var me 			= this,
						_checkValue = function( v, min, max )
						{
							v = parseInt( v );
							v = ( isNaN( v ) ) ? max : v;
							return Math.min(Math.max(v,min),max);
						};

					// Date
					me.dformat		= me.dformat.replace(/\//g, me.dseparator);
                    me.invalidDates = me.invalidDates.replace( /\s+/g, '' );
					if( me.dropdownRange.indexOf( ':' ) == -1 ) me.dropdownRange = '-10:+10';
					if( !/^\s*$/.test( me.invalidDates ) )
					{
						var	dateRegExp = new RegExp( /^\d{1,2}\/\d{1,2}\/\d{4}$/ ),
							counter = 0,
							dates = me.invalidDates.split( ',' );
						me.invalidDates = [];
						for( var i = 0, h = dates.length; i < h; i++ )
						{
							var range = dates[ i ].split( '-' );
							if( range.length == 2 && range[0].match( dateRegExp ) != null && range[1].match( dateRegExp ) != null )
							{
								var fromD = new Date( range[ 0 ] ),
									toD = new Date( range[ 1 ] );
								while( fromD <= toD )
								{
									me.invalidDates[ counter ] = fromD;
									var tmp = new Date( fromD.valueOf() );
									tmp.setDate( tmp.getDate() + 1 );
									fromD = tmp;
									counter++;

								}
							}
							else
							{
								for( var j = 0, k = range.length; j < k; j++ )
								{
									if( range[ j ].match( dateRegExp ) != null )
									{
										me.invalidDates[ counter ] = new Date( range[ j ] );
										counter++;
									}
								}
							}
						}
					}

					// Time
					me.minHour 		= _checkValue( me.minHour, 0, 23 );
					me.maxHour 		= _checkValue( me.maxHour, 0, 23 );
					me.minMinute 	= _checkValue( me.minMinute, 0, 59 );
					me.maxMinute 	= _checkValue( me.maxMinute, 0, 59 );
					me.stepHour 	= _checkValue( me.stepHour, 1, Math.max( 1, me.maxHour - me.minHour ) );
					me.stepMinute 	= _checkValue( me.stepMinute, 1, Math.max( 1, me.maxMinute - me.minMinute ) );

					// Set handles
					me._setHndl('minDate');
					me._setHndl('maxDate');
                },
			get_hours:function()
				{
					var me = this,
						str = '',
						i = 0,
						h,
						from = ( me.tformat == 12 ) ? 1  : me.minHour,
						to   = ( me.tformat == 12 ) ? 12 : me.maxHour;

					while( ( h = from + me.stepHour * i ) <= to )
					{
						if( h < 10 ) h = '0'+''+h;
						str += '<option value="' + h + '">' + h + '</option>';
						i++;
					}
					return '<select id="'+me.name+'_hours" name="'+me.name+'_hours" class="hours-component" aria-label="'+$.fbuilder.htmlEncode(me.ariaHourLabel)+'">' + str + '</select>:';
				},
			get_minutes:function()
				{
					var me = this,
						str = '',
						i = 0,
						m,
						n = (me.minHour == me.maxHour)?me.minMinute : 0,
						x = (me.minHour == me.maxHour)?me.maxMinute : 59;

					while( ( m = n + me.stepMinute * i ) <= x )
					{
						if( m < 10 ) m = '0'+''+m;
						str += '<option value="' + m + '">' + m + '</option>';
						i++;
					}
					return '<select id="'+me.name+'_minutes" name="'+me.name+'_minutes" class="minutes-component" aria-label="'+$.fbuilder.htmlEncode(me.ariaMinuteLabel)+'">' + str + '</select>';
				},
			get_ampm:function()
				{
					var str = '';
					if( this.tformat == 12 )
					{
						return '<select id="'+this.name+'_ampm" class="ampm-component"  aria-label="'+$.fbuilder.htmlEncode(this.ariaAMPMLabel)+'"><option value="am">am</option><option value="pm">pm</option></select>';
					}
					return str;
				},
			set_dateTime:function()
				{
					var me = this,
						str = $( '#'+me.name+'_date' ).val();
					if( me.showTimepicker )
					{
						str += ' '+$( '#'+me.name+'_hours' ).val();
						str += ':'+$( '#'+me.name+'_minutes' ).val();
						if( $( '#'+me.name+'_ampm' ).length ) str += $( '#'+me.name+'_ampm' ).val();
					}
					$( '#'+me.name ).val( str ).change();
				},
			set_minDate:function(v, ignore)
				{
					var e = $('[id*="'+this.name+'"].hasDatepicker');
					if(e.length)
					{
						e.datepicker('option', 'minDate', (ignore) ? null : v);
						e.change();
					}
				},
			set_maxDate:function(v, ignore)
				{
					var e = $('[id*="'+this.name+'"].hasDatepicker');
					if(e.length)
					{
						e.datepicker('option', 'maxDate', (ignore) ? null : v);
						e.change();
					}
				},
			set_DefaultDate : function()
				{
					var me = this,
						p  = {
							dateFormat: me.dformat.replace(/yyyy/g,"yy"),
							minDate: me._getAttr('minDate'),
							maxDate: me._getAttr('maxDate')
						},
						dp = $( "#"+me.name+"_date" ),
						dd = (me.defaultDate != "") ? me.defaultDate : ( ( me.predefined != "" ) ? me.predefined : new Date() );

					dp.click( function(){ $(document).click(); $(this).focus(); } );
					if(me.showDropdown ) p = $.extend(p,{changeMonth: true,changeYear: true,yearRange: me.dropdownRange});
					p = $.extend(p, {beforeShowDay:(function(w,i) { return function(d){return [me._validateDate(d, w, i), ""];};})(me.working_dates, me.invalidDates)});

					dp.datepicker(p);
                    if(!me.predefinedClick) dp.datepicker( "setDate", dd);
                    if(!me._validateDate(dp.datepicker("getDate"), me.working_dates, me.invalidDates)) dp.datepicker( "setDate", '');
				},
			set_DefaultTime : function()
				{
					var me 			= this,
						_setValue 	= function( f, v, m )
						{
							v = Math.min( v*1, m*1 );
							v = ( v < 10 ) ? 0+''+v : v;
							$( '#' + f + ' [value="' + v + '"]' ).prop( 'selected', true );
						};

					if( me.showTimepicker )
					{
						var parts, time = {}, tmp = 0, max_minutes = 59;
						if( ( parts = /(\d{1,2}):(\d{1,2})\s*([ap]m)?/gi.exec( me.defaultTime ) ) != null )
						{
							time[ 'hour' ] = parts[ 1 ]*1+((parts.length == 4 && /pm/i.test(parts[3]) && parts[1] != 12) ? 12 : 0);
							time[ 'minute' ] = parts[ 2 ];
						}
						else
						{
							var d = new Date();
							time[ 'hour' ] = d.getHours();
							time[ 'minute' ] = d.getMinutes();
						}

						time[ 'hour' ] = Math.min(Math.max(time[ 'hour' ], me.minHour), me.maxHour);
						if(time[ 'hour' ] <= me.minHour) time[ 'minute' ] = Math.max(time['minute'],me.minMinute);
						if(me.maxHour <= time[ 'hour' ]) time[ 'minute' ] = Math.min(time['minute'],me.maxMinute);

						_setValue(
							me.name+'_hours',
							( me.tformat == 12 ) ? ( ( time[ 'hour' ] > 12 ) ? time[ 'hour' ] - 12 : ( ( time[ 'hour' ] == 0 ) ? 12 : time[ 'hour' ] ) ) : time[ 'hour' ],
							( me.tformat == 12 ) ? 12 : me.maxHour
						);

						_setValue( me.name+'_minutes', time[ 'minute' ], (time[ 'hour' ] == me.maxHour) ? me.maxMinute : 59);

						$( '#'+me.name+'_ampm'+' [value="' + ( ( time[ 'hour' ] < 12 ) ? 'am' : 'pm' ) + '"]' ).prop( 'selected', true );
					}
				},
			show:function()
				{
                    var me				= this,
						n 				= me.name,
						attr 			= 'value',
						format_label   	= [],
						date_tag_type  	= 'text',
						disabled		= '',
						date_tag_class 	= 'field date'+me.dformat.replace(/[^a-z]/ig,"")+' '+me.size+((me.required && me.showDatepicker)?' required': '');

                    if( me.predefinedClick ) attr = 'placeholder';
                    if( me.showDatepicker ) format_label.push(me.dformat);
					else{ date_tag_type = 'hidden'; disabled='disabled';}
                    if( me.showTimepicker ) format_label.push('HH:mm');

					return '<div class="fields '+me.csslayout+' '+n+' cff-date-field" id="field'+me.form_identifier+'-'+me.index+'"><label for="'+n+'_date">'+me.title+''+((me.required)?"<span class='r'>*</span>":"")+( (format_label.length) ? ' <span class="dformat">('+format_label.join(' ')+')</span>' : '' )+'</label><div class="dfield"><input id="'+n+'" name="'+n+'" type="hidden" value="'+$.fbuilder.htmlEncode(me.predefined)+'"/><input id="'+n+'_date" name="'+n+'_date" class="'+date_tag_class+' date-component" type="'+date_tag_type+'" '+attr+'="'+$.fbuilder.htmlEncode(me.predefined)+'" '+disabled+' />'+( ( me.showTimepicker ) ? ' '+me.get_hours()+me.get_minutes()+' '+me.get_ampm() : '' )+'<span class="uh">'+me.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			after_show:function()
				{
					var me = this,
						date_format = 'date'+me.dformat.replace(/[^a-z]/ig,""),
						validator = function( v, e )
						{

							try
							{
								var _dp			= $.datepicker,
									_fb			= $.fbuilder,
									p           = e.name.replace('_date', '').split('_'),
									_index		= (p.length > 1) ? '_'+p[ 1 ] : '',
									item        = ('forms' in _fb && _index in _fb[ 'forms' ])
												? _fb[ 'forms' ][ _index ].getItem(p[ 0 ]+'_'+p[ 1 ]) : null,
									inst        = _dp._getInst( e ),
									minDate     = _dp._determineDate( inst, _dp._get( inst, 'minDate'), null),
									maxDate     = _dp._determineDate(inst, _dp._get(inst, 'maxDate'), null),
									dateFormat  = _dp._get(inst, 'dateFormat'),
									date        = _dp.parseDate(dateFormat, v, _dp._getFormatConfig(inst));

								if( item != null )
								{
									return 	this.optional( e ) ||
											(
												( minDate == null || date >= minDate  ) &&
												( maxDate == null || date <= maxDate ) &&
												item._validateDate( $( e ).datepicker( 'getDate' ), item.working_dates, item.invalidDates ) &&
												item._validateTime( e, item )
											);
								}
								return true;
							}
							catch( er )
							{
								return false;
							}
						};

                    if(!(date_format in $.validator.methods)) $.validator.addMethod(date_format, validator );

					me.set_DefaultDate();
					me.set_DefaultTime();
					me._set_Events();
					me.set_dateTime();
				},
			val:function(raw)
				{
					raw = raw || false;
					var me = this,
						e  = $( '[id="' + me.name + '"]:not(.ignore)' ),
						dformat = me.dformat.replace(new RegExp('\\'+me.dseparator, 'g'), '/');
					if( e.length )
					{
						var v  = e.val(), rt;
						if(raw) return $.fbuilder.parseValStr(v, raw);

						if( dformat == 'yyyy/mm/dd' || dformat == 'yyyy/dd/mm' )
							rt = '(\\d{4})[\\/\\-\\.](\\d{1,2})[\\/\\-\\.](\\d{1,2})';
						else
							rt = '(\\d{1,2})[\\/\\-\\.](\\d{1,2})[\\/\\-\\.](\\d{4})';

						v  = $.trim(e.val());
						var re = new RegExp( rt+'(\\s(\\d{1,2})[:\\.](\\d{1,2})\s*([amp]{2})?)?' ),
							d  = re.exec( v ),
							h  = 0,
							m  = 0,
							date;

						if( d )
						{
							if( typeof d[ 5 ] != 'undefined' ) h = d[ 5 ]*1;
							if( typeof d[ 6 ] != 'undefined' ) m = d[ 6 ]*1;
							if( typeof d[ 7 ] != 'undefined' )
							{
								var am = d[ 7 ].toLowerCase();
								if(am == 'pm' && h < 12 ) h += 12;
								if(am == 'am' && h == 12) h -= 12;
							}
							switch( dformat )
							{
								case 'yyyy/dd/mm':
									date = new Date( d[ 1 ], ( d[ 3 ] * 1 - 1 ), d[ 2 ], h, m, 0, 0 );
								break;
								case 'yyyy/mm/dd':
									date = new Date( d[ 1 ], ( d[ 2 ] * 1 - 1 ), d[ 3 ], h, m, 0, 0 );
								break;
								case 'dd/mm/yyyy':
									date = new Date( d[ 3 ], ( d[ 2 ] * 1 - 1 ), d[ 1 ], h, m, 0, 0 );
								break;
								case 'mm/dd/yyyy':
									date = new Date( d[ 3 ], ( d[ 1 ] * 1 - 1 ), d[ 2 ], h, m, 0, 0 );
								break;
							}
							if( me.showTimepicker ) return date.valueOf() / 86400000;
							else return Math.ceil( date.valueOf() / 86400000 );
						}
					}
					return 0;
				},
			setVal:function( v )
				{
					try
					{
						v = $.trim(v)
							 .replace( /\s+/g, ' ' )
							 .split( ' ' );
						if(this.showDatepicker)
						{
							this.defaultDate = v[ 0 ];
							this.set_DefaultDate();
						}
						if(this.showTimepicker)
						{
							var t = (v.length == 2) ? v[1] : ((!this.showDatepicker) ? v[0] : false);
							if(t !== false)
							{
								this.defaultTime = t;
								this.set_DefaultTime();
							}
						}
						this.set_dateTime();
					}
					catch( err )
					{}
				}
		}
	);