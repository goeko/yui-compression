/**
 * DJIndexes.widget.InfoWindow
 */
Ext.ns('DJIndexes.widget');

/**
 * This is a tabpanel within a panel.
 * 
 * Normally we wouldn't do this, but since this is a standalone
 * component, it needed a clean/framed container.
 */
DJIndexes.widget.InfoWindow = Ext.extend(Ext.Window,{
	
	//default config options
	defaultConfig: {
		autoShow: false,
		width: 300,
		height: 300,
		modal: (Ext.isIE6) ? false : true,
		autoDestroy: false,
		title: '',
		preventBodyReset: true,
		autoScroll: true,
		padding: '0 15px 20px 15px',
		bodyStyle: {
			fontFamily: 'Arial',
			backgroundColor: '#fff',
			fontSize: '.85em'
		}
	},
	
	//constructor
	constructor: function(userConfig) {
		
		this.cls = 'widget';
		this.closeAction = 'hide';
		
		DJIndexes.widget.InfoWindow.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		// render to passed el or pre-configured one
		this.render( Ext.getBody() );
		
		if (this.autoShow) {
			this.show();
		}
		
		this.init();
		
	},
	
	init: function() {
		
		// attach click listeners, if necessary
		if (this.autoLinkCls) {
			Ext.select(this.autoLinkCls).on('click',function(e,t){
				e.preventDefault();
				this.show(t);
			},this);
		}
		
	}
	
});







