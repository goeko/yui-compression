/**
 * DJIndexes.widget.ContactForm
 */
Ext.QuickTips.init();
Ext.form.Field.prototype.msgTarget = 'side';

Ext.ns('DJIndexes.widget.data.contactForm');

DJIndexes.widget.data.contactForm = {
	
	regions: [
		['asiaPacific', 'Asia/Pacific'],
		['europe', 'Europe'],
		['latinAmerica', 'Latin America'],
		['middleEast', 'Middle East'],
		['northAmerica', 'North America']
	],
	
	subjects: [
		['benchmark', 'Benchmarks for a pension plan'],
		['custom', 'Custom indexes'],
		['ftp', 'Data available via FTP service'],
		['data', 'Data requests'],
		['methodologies', 'Index methodologies and procedures'],
		['icb', 'Industry Classification Benchmark (ICB)'],
		['marketing', 'Marketing materials'],
		['realTime', 'Real time and delayed index data'],
		['web', 'Web site related issues'],
		['other', 'Other']
	]
	
};

DJIndexes.widget.ContactForm = Ext.extend(Ext.FormPanel,{
	
	// default config options
	defaultConfig: {
		url: '/DataProxy/ContactForm.cfc',
		method: 'post',
		baseParams: {
			method: 'webToCase'
		},
		hiddenFields: [],
		additionalParams: [],
		container: 'contact-form',
		buttonAlign: 'center',
		width: 500,
		monitorValid: true,
		monitorPoll: 1000,
		frame: true,
		autoHeight: true,
		collapsible: true,
		titleCollapse: true,
		title: 'Contact Form',
		defaultType: 'textfield',
		bodyStyle: {
			padding: '10px'
		},
		defaults: {
			width: 350,
			invalidText: 'This field is required',
			allowBlank: false
		},
		items: [
			{
				xtype: 'hidden',
				name: 'formName',
				value: 'DJI Website Inquiry Form'
			},
			{
				fieldLabel: 'Full Name',
				name: 'name'
			},
			{
				fieldLabel: 'Email Address',
				name: 'email',
				vtype: 'email'
			},
			{
				fieldLabel: 'Company Name',
				name: 'company'
			},
			new Ext.form.ComboBox({
				fieldLabel: 'Region',
				emptyText: 'Select one...',
				name: 'region',
				store: new Ext.data.ArrayStore({
					autoDestroy: true,
					fields: [ 'key', 'label' ],
					data: DJIndexes.widget.data.contactForm.regions
				}),
				valueField: 'key',
				displayField: 'label',
				mode: 'local',
				triggerAction: 'all'
			}),
			new Ext.form.ComboBox({
				fieldLabel: 'Subject',
				emptyText: 'Select one...',
				name: 'subject',
				store: new Ext.data.ArrayStore({
					autoDestroy: true,
					fields: [ 'key', 'label' ],
					data: DJIndexes.widget.data.contactForm.subjects
				}),
				valueField: 'key',
				displayField: 'label',
				mode: 'local',
				triggerAction: 'all'
			}),
			{
				xtype: 'textarea',
				fieldLabel: 'Comments',
				name: 'description',
				height: 100
			}
		]
	},
	
	/**
	 * Constructor
	 * 
	 * @param {String} el
	 * @param {Object} userConfig
	 */
	constructor: function(el, userConfig) {
		
		this.cls = 'widget';
		
		DJIndexes.widget.ContactForm.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		// hidden fields from user config
		this.add(this.hiddenFields);
		
		// hidden params from user config
		try {
			var params = '';
			Ext.each(this.additionalParams,function(p){
				params+= p.name + '=' + p.value + '|';
			});
			if(params){
				this.add({
					xtype: 'hidden',
					name: 'params',
					value: params
				});
			}
		} catch(e) {}
		
		// buttons
		this.addButton({
			id: 'btn-submit',
			text: 'Send',
			type: 'submit',
			scale: 'medium',
			disabled: true,
			handler: function() {
				this.form.submit();
			},
			scope: this
		});
		
		this.addButton({
			id: 'btn-reset',
			text: 'Cancel',
			type: 'reset',
			scale: 'medium',
			handler: function() {
				this.form.reset();
			},
			scope: this
		});
		
		// listeners
		this.on( 'clientvalidation', this.validate, this );
		this.on( 'beforeaction', this.showProgress, this );
		this.on( 'actioncomplete', this.handleFormSubmission, this );
		this.on( 'actionfailed', this.handleFormSubmission, this );
		
		// render to passed el or pre-configured one
		this.render( el || Ext.get(this.defaultConfig.container) );
		
	},
	
	validate: function(f, valid) {
		var el = 'btn-submit';
		if (valid) {
			Ext.getCmp(el).enable();
		} else {
			Ext.getCmp(el).disable();
		}
	},
	
	showProgress: function() {
		Ext.MessageBox.wait('Submitting...','Please wait while we submit your inquiry.');
		Ext.MessageBox.updateProgress(.3);
	},
	
	handleFormSubmission: function(f,action) {
		if (action.result) {
			if (action.result.success) {
				this.form.reset();
				Ext.MessageBox.alert( 'Thank you', 'Thank you for your inquiry. We will respond to you as soon as possible.' );
			}
		} else {
			Ext.MessageBox.alert( 'An error has occurred', 'An error occurred while submitting your request, please try again.' );
		}
	},
	
	debug: function() {
		console.debug(arguments);
	}
	
});