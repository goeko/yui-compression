/**
 * DJIndexes.widget.InfoTabs
 */

Ext.ns('DJIndexes.widget');

/**
 * This is a tabpanel within a panel.
 * 
 * Normally we wouldn't do this, but since this is a standalone
 * component, it needed a clean/framed container.
 */
DJIndexes.widget.InfoTabs = Ext.extend(Ext.Panel,{
	
	//default config options
	defaultConfig: {
		layout: 'fit',
		frame: true,
		header: false,
		defaults: {
			autoHeight: true,
			activeTab: 0,
			enableTabScroll: true,
			animScroll: true,
			padding: '0 15px 20px 15px',
			bodyStyle: {
				fontFamily: 'Arial',
				backgroundColor: '#fff',
				fontSize: '.85em'
			}
		}
	},
	
	//constructor
	constructor: function(el, userConfig) {
		
		this.container = el;
		this.cls = 'widget';
		
		DJIndexes.widget.InfoTabs.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		this.width = Ext.get(this.container || Ext.getBody()).parent().getComputedWidth();
		
		this.add({
			xtype: 'tabpanel',
			defaults: {
				autoHeight: true,
				cls: 'dji-infotab'
			},
			items: this.tabs
		});
		
		// render to passed el or pre-configured one
		this.render( this.container || Ext.getBody() );
		
	}
	
});