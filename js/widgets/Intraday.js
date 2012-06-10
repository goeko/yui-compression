/**
 * DJIndexes.widget.Intraday
 */
Ext.QuickTips.init();
Ext.Ajax.disableCaching = false;

Ext.ns('DJIndexes.widget.data.intraday');

/**
 * Core widget
 * DJIndexes.widget.Intraday
 */
DJIndexes.widget.Intraday = Ext.extend(Ext.Panel,{
	
	//default config options
	defaultConfig: {
		numberFormat: '0.00',
		proxy: '/DataService/v2/Intraday.cfc',
		familyId: null,
		activeTab: 0,
		title: 'Intraday',
		layout: 'border',
		frame: true,
		defaults: {
			split: false,
			border: true
		}
	},
	
	//constructor
	constructor: function(el, userConfig) {
		
		this.container = el;
		this.addEvents('tickerselected');
		this.cls = 'widget';
		
		DJIndexes.widget.Intraday.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		this.renderer = new DJIndexes.Utils.numberFormatter(this.numberFormat);
		
		// hardcode size
		this.height = 625;
		
		this.add([
			{
				region: 'north',
				xtype: 'tabpanel',
				enableTabScroll: true,
				animScroll: true,
				height: 156,
				minHeight: 116,
				maxHeight: 200
			},
			{
				region: 'center',
				xtype: 'dji-intraday-quote',
				layout: 'fit',
				renderer: this.renderer
			},
			{
				region: 'south',
				xtype: 'dji-intraday-chart',
				layout: 'fit',
				height: 265,
				minHeight: 265,
				maxHeight: 265,
				renderer: this.renderer
			}
		]);
		
		this.on({
			'tickerselected': function(data) {
				var c = this.findByType('dji-intraday-chart',true)[0];
				c.init(data);
				var q = this.findByType('dji-intraday-quote',true)[0];
				q.init(data);
			},
			scope: this
		});
		
		// render to passed el or pre-configured one
		this.render( this.container || Ext.getBody() );
		
		this.init();
		
	},
	
	init: function() {
		
		// retrieve grid panels for family
		Ext.Ajax.request({
			url: this.proxy,
			method: 'POST',
			params: {
				method: 'getFamilies',
				type: this.familyId
			},
			callback: this.handleSetupRequest,
			scope: this
		});
		
	},
	
	handleSetupRequest: function(options, success, response) {
		
		var grids = [];
		
		if (success) {
			
			var data = this.decode(response.responseText);
			if (data) {
				
				// create family grids
				Ext.each(data.data, function(family, i) {
					var grid = this.createFamilyGrid(family);
					this.relayEvents(grid,['tickerselected']);
					grids.push(grid)
				}, this);
				
			}
			
			// when there are grids, add them to center region
			if (grids.length) {
				var r = this.findByType('tabpanel',true)[0];
				r.add(grids);
				r.setActiveTab(this.activeTab || 0);
			}
			
			// make sure regions are propery sized
			this.doLayout();
			
		}
		
	},
	
	createFamilyGrid: function(family) {
		
		var store = new Ext.data.JsonStore({
			autoDestroy: true,
			url: this.proxy,
			method: 'POST',
			baseParams: {
				method: 'getIndexes',
				familyId: family.key
			},
			root: 'data',
			totalProperty: 'size',
			fields: [
				'indexname',
				'ticker',
				'lasttime',
				{ name: 'last', type: 'float' },
				{ name: 'netchange', type: 'float' },
				'bigchartsid'
			]
		});
		
		var cols = new Ext.grid.ColumnModel({
			defaults: {
				sortable: true
			},
			columns: [
				{ header: 'Index', dataIndex: 'ticker' },
				{ header: 'Date Time', dataIndex: 'lasttime' },
				{ header: 'Last', dataIndex: 'last', renderer: this.renderer.decimal },
				{ header: 'Net Change', dataIndex: 'netchange', renderer: this.renderer.change }
			]
		});
		
		var sm = new Ext.grid.RowSelectionModel({
			singleSelect: true
		});
		
		var gp = new Ext.grid.GridPanel({
			store: store,
			cm: cols,
			sm: sm,
			title: family.display,
			stripeRows: true,
			columnLines: true,
			enableColumnHide: false,
			enableColumnMove: false,
			viewConfig: {
				autoFill: true,
				forceFit: true
			},
			loadMask: new Ext.LoadMask(this.container, {
				msg: 'Loading...'
			})
		});
		
		gp.on({
			'activate': this.handlePanelActivation,
			scope: gp
		});
		
		sm.on({
			'rowselect': this.handleRowSelection,
			scope: gp
		});
		
		return gp;
		
	},
	
	handlePanelActivation: function(p) {
		p.store.load({
			callback: function() {
				this.selModel.selectFirstRow();
			},
			scope: this
		});
	},
	
	handleRowSelection: function(selModel,rowIdx,e) {
		var data = this.store.getAt(rowIdx).data;
		this.fireEvent('tickerselected', data);
	},
	
	decode: function(data) {
		var o;
		try {
			o = Ext.decode(data);
		} catch (e) {}
		return o;
	}
	
});



/**
 * Intraday chart panel
 * DJIndexes.widget.IntradayChart
 * xtype: dji-intraday-chart
 */
DJIndexes.widget.IntradayChart = Ext.extend(Ext.Panel,{
	
	templates: {
		chart: new Ext.XTemplate(
			'<img width="375" height="214" border="0" src="{chartURL}" title="{title}" alt="{title}" />'
		).compile()
	},
	
	controls: [
		{ label: 'Today', value: '1dy' },
		{ label: '5d', value: '5dy' },
		{ label: '1m', value: '1mo' },
		{ label: '3m', value: '3mo' },
		{ label: '1y', value: '1yr' },
		{ label: '5y', value: '5yr' },
		{ label: '10y', value: '10yr' }
	],
	
	bigcharts: {
		url: 'http://chart.bigcharts.com/custom/djindexes-com/big.chart?type=256&ma=3&maval=100&style=2281&rightfill=0&uf=8192',
		frequency: {
			'1dy': '1mi',
			'5dy': '15mi',
			'1mo': '1dy',
			'3mo': '1dy',
			'1yr': '1wk',
			'5yr': '1wk',
			'10yr': '1mo'
		}
	},
	
	//default config options
	defaultConfig: {
		proxy: '/DataService/v2/Intraday.cfc',
		collapsible: false,
		showTitle: false,
		defaults: {
			autoWidth: true,
			autoHeight: true,
			split: false
		},
		tabPosition: 'top'
	},
	
	//constructor
	constructor: function(userConfig) {
		
		DJIndexes.widget.IntradayChart.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		this.add([
			{
				region: 'center',
				xtype: 'tabpanel',
				split: true,
				autoScroll: true,
				animScroll: true,
				resizeTabs: true,
				tabPosition: this.tabPosition,
				activeTab: 0,
				defaults: {
					bodyStyle: {
						fontFamily: 'Arial',
						backgroundColor: '#e8f0f5',
						padding: '13px 2px 5px 10px' // chart is 214px high, plus 1em of padding top and bottom
					},
					height: 232
				}
			}
		]);
		
	},
	
	init: function(data) {
		this.setTitle(data.indexname);
		this.setChartTabs(data, this);
	},
	
	setChartTabs: function(data, config, size) {
		
		var tabs = [];
		Ext.each(this.controls,function(c,i){
			
			var time = c.value;
			var size = (size) ? size : 8;
			var url = config.bigcharts.url
				+ '&ticker=' + data.ticker // pass ticker for debugging purposes
				+ '&symb=' + time
				+ '&sid='  + data.bigchartsid
				+ '&size=' + size
				+ '&time=' + time
				+ '&freq=' + config.bigcharts.frequency[time]
			;
			
			var html = (data.bigchartsid) ? config.templates.chart.applyTemplate({
				chartURL: url,
				title: data.indexname
			}) : time.toUpperCase() + ' chart is not available.';
			
			var tab = {
				title: c.label,
				html: html
			};
			
			tabs.push(tab);
			
		});
		
		var p = config.findByType('tabpanel')[0];
		p.removeAll();
		p.add(tabs);
		p.setActiveTab(1);
		
	},
	
	decode: function(data) {
		var o;
		try {
			o = Ext.decode(data);
		} catch (e) {}
		return o;
	}
	
});
Ext.reg('dji-intraday-chart', DJIndexes.widget.IntradayChart);



/**
 * Intraday quote panel
 * DJIndexes.widget.IntradayQuote
 * xtype: dji-intraday-chart
 */
DJIndexes.widget.IntradayQuote = Ext.extend(Ext.Panel,{
	
	//default config options
	defaultConfig: {
		proxy: '/DataService/v2/Intraday.cfc',
		bodyStyle: {
			fontFamily: 'Arial',
//			backgroundColor: '#e8f0f5',
			padding: '10px 5px'
		},
		defaults: {
			border: false
		}
	},
	
	//constructor
	constructor: function(userConfig) {
		
		DJIndexes.widget.IntradayQuote.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		this.store = new Ext.data.JsonStore({
			autoLoad: false,
			url: this.proxy,
			method: 'POST',
			baseParams: {
				method: 'getIndexDetails',
				full: true
			},
			root: 'data',
			totalProperty: 'size',
			fields: [
				'indexname',
				{ name: 'price', convert: this.renderer.decimal },
				{ name: 'netchange', convert: this.renderer.change },
				{ name: 'percentagechange', convert: this.renderer.change },
				{ name: 'openprice', convert: this.renderer.decimal },
				'volume',
				{ name: 'high', convert: this.renderer.decimal },
				{ name: 'low', convert: this.renderer.decimal },
				{ name: 'ytdnetchange', convert: this.renderer.change },
				{ name: 'ytdpctchange', convert: this.renderer.change }
			]
		});
		
		this.template = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="intraday-quote">',
					'<div class="indexname">{indexname}</div>',
					'<div class="intraday-price">{price}</div>',
					'<ul class="intraday-details">',
						'<li><span class="label">Net Chg:</span> {netchange}</li>',
						'<li><span class="label">% Chg:</span> {percentagechange}</li>',
						'<li><span class="label">Open:</span> {openprice}</li>',
						'<li><span class="label">Volume:</span> {volume}</li>',
						'<li><span class="label">High:</span> {high}</li>',
						'<li><span class="label">Low:</span> {low}</li>',
						'<li><span class="label">YTD Net Chg:</span> {ytdnetchange}</li>',
						'<li><span class="label">YTD % Chg:</span> {ytdpctchange}</li>',
					'</ul>',
				'</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		).compile();
		
		this.add(
			new Ext.DataView({
				store: this.store,
				tpl: this.template
			})
		);
		
	},
	
	init: function(data) {
		this.store.load({
			params: {
				ticker: data.ticker
			}
		});
	}
	
});
Ext.reg('dji-intraday-quote', DJIndexes.widget.IntradayQuote);