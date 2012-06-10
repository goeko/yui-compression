/**
 * DJIndexes.widget.MediaCenter
 */
// Brightcove
Ext.ns('BCAPI');
BCAPI.ready = false;

function onTemplateLoaded(experienceID) {
	BCAPI.player = brightcove.getExperience(experienceID);
	BCAPI.video = BCAPI.player.getModule(APIModules.VIDEO_PLAYER);
	BCAPI.content = BCAPI.player.getModule(APIModules.CONTENT);
	BCAPI.exp = BCAPI.player.getModule(APIModules.EXPERIENCE);
	BCAPI.social = BCAPI.player.getModule(APIModules.SOCIAL);
	
	/* listeners */
	BCAPI.exp.addEventListener(BCExperienceEvent.TEMPLATE_READY, onTemplateReady);
}

function onTemplateReady() {
	BCAPI.ready = true;
}

function loadVideo(video){
	if ( BCAPI.ready && video.id ) {
		if (BCAPI.video.isPlaying()) { BCAPI.video.stop(); }
		BCAPI.video.cueVideo(video.id);
		videoPanel.setTitle(video.title);
	}
}



Ext.ns('DJIndexes.widget.MediaCenter.data');
DJIndexes.widget.MediaCenter = Ext.extend(Ext.Panel,{
	
	tpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div id="{id}" class="mc-playlist-item">',
				'<img src="{thumb}" width="120" height="90" />',
				'<span class="title">{title}</span>',
				'<p class="meta description">{description}</p>',
			'</div>',
			'<div class="x-clear"></div>',
		'</tpl>'
	),
	
	//default config options
	defaultConfig: {
		playlistSelector: '.playlist',
		playerId: '28221116001',
		publisherId: '86240652',
		proxy: '/DataService/v2/MediaCenter.cfc',
		method: 'POST',
		baseParams: {
			method: 'getPlaylist'
		},
		activeTab: 0,
		playlists: [],
		title: 'Dow Jones Indexes Media Center',
		header: false,
		collapsible: false,
		playerContainer: 'brightcove-player',
		layout: 'border',
		frame: true,
		autoWidth: true,
		height: 460,
		defaults: {
			split: true,
			frame: true
		}
	},
	
	//constructor
	constructor: function(el, userConfig) {
		
		this.cls = 'widget';
		this.container = el;
		
		DJIndexes.widget.MediaCenter.superclass.constructor.call( this, Ext.apply(this.defaultConfig, userConfig) );
		
		this.init();
		
	},
	
	init: function() {
		this.createBCPlayer();
		this.createRegions();
		this.render( this.container || Ext.getBody() );
		window.videoPanel = this.findByType('panel',true)[0];
		this.displayPlaylists();
	},
	
	/**
	 * This method will provide enough time for the BC player to initialize itself
	 * before loading the playlist tabs.
	 */
	displayPlaylists: function() {
		Ext.TaskMgr.start({
			run: function() {
				if (BCAPI.ready) {
					Ext.TaskMgr.stopAll();
					this.createPlaylists();
				}
			},
			interval: 800,
			duration: 5000, //prevent run away in case of BC failure
			scope: this
		});
	},
	
	createBCPlayer: function() {
		
		var el = Ext.getDom(
			Ext.DomHelper.append(Ext.getBody(),[
				{ tag: 'div', id: this.playerContainer }
			])
		);
		
		var params = {};
			params.playerID = this.playerId;
			params.bgcolor = '#e0e8f6';
			params.width = '486';
			params.height = '412';
			params.publisherID = this.publisherId;
			params.isVid = true;
			
		var player = brightcove.createElement('object');
			player.id = Ext.id();
			
		var parameter;
		for (var i in params) {
			parameter = brightcove.createElement('param');
			parameter.name = i;
			parameter.value = params[i];
			player.appendChild(parameter);
		}
		
		brightcove.createExperience(player, el, true);
		
	},
	
	createRegions: function() {
		this.add([
			{
				region: 'west',
				xtype: 'panel',
				width: 498,
				contentEl: this.playerContainer,
				autoShow: true,
				title: '&nbsp;',
				minWidth: 498
			},
			{
				region: 'center',
				xtype: 'tabpanel',
				autoScroll: true,
				hidden: true,
				bodyStyle: {
					fontFamily: 'Arial',
					fontSize: '.85em',
					backgroundColor: '#e0e8f6'
				},
				defaults: {
					xtype: 'dataview',
					frame: true,
					autoWidth: true,
					singleSelect: true,
					overClass: 'x-view-over',
					itemSelector: 'div.mc-playlist-item',
					emptyText: '<p>No videos found.</p>'
				}
			}
		]);
	},
	
	createPlaylists: function() {
		
		if (this.playlists && this.playlists.length) {
			
			var tabs = [];
			
			Ext.each(this.playlists,function(p) {
				
				var params, store, id = Ext.id();
				try {
					params = { 'id': p.playlistId };
					store = this.createPlaylistStore(params,id);
					tabs.push({
						id: id,
						title: p.title,
						store: store,
						tpl: this.tpl,
						listeners: {
							// only load store once
							show: function(dv) {
								if (!this.store.totalLength) {
									this.store.load();
								}
							},
							click: function(dv,idx,node,e) {
								loadVideo(dv.store.data.items[idx].data);
							},
							selectionchange: function(dv,selections) {
								var item = this.store.getById(selections[0].id);
								loadVideo(item.data);
							}
						}
					});
				} catch(e){}
				
			},
			this);
			
			if (tabs.length) {
				var r = this.findByType('tabpanel',true)[0];
					r.add(tabs);
					r.show();
					r.setActiveTab(this.activeItem || 0);
				this.doLayout();
			}
			
		} else {
			
			this.disable();
			Ext.MessageBox.show({
				title: 'INFO',
				msg: 'Sorry, this playlist is empty.',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING,
				minWidth: 250
			});
			
		}
		
	},
	
	createPlaylistStore: function(params,dataviewId) {
		var _baseParams = Ext.apply(params,this.baseParams);
		var store = new Ext.data.JsonStore({
			autoLoad: false,
			url: this.proxy,
			baseParams: _baseParams,
			root: 'data.videos',
			idProperty: 'id',
			fields: [
				'id',
				{ name: 'thumb', mapping: 'thumbnailURL' },
				{ name: 'title', mapping: 'name' },
				{ name: 'description', mapping: 'shortDescription' }
			],
			listeners: {
				load: function(store,records,options) {
					Ext.getCmp(dataviewId).select(0);
				}
			}
		});
		return store;
	}
	
});