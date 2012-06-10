/**
 * googlemaps-yelp-ext
 * @author cbetancourt
 */

Ext.BLANK_IMAGE_URL = '/js/ext/2.2/resources/images/default/s.gif';
Ext.QuickTips.init();

Ext.namespace('Sample');
Sample.YelpSearch = Ext.extend(Ext.Viewport, {
	
	initComponent: function() {
		
		var location = this.getLocation();
		var geocoder = new google.maps.ClientGeocoder();
		
		var searchForm = new Ext.form.FormPanel({
			region: 'north',
			id: 'criteria-form',
			title: 'Criteria',
			titleCollapse: true,
			onSubmit: validateForm,
			autoHeight:  true,
			buttonAlign: 'right',
			labelAlign: 'left',
			labelWidth: 75,
			frame: true,
			collapsible: true,
			defaultType: 'textfield',
			defaults: {
				allowBlank: false,
				width: 200
			},
			items: [
				{
					fieldLabel: 'Type of Food',
					name: 'term',
					value: 'Sushi',
					blankText: 'Please enter a search term, for example, \"Sushi\" or \"Pizza\"'
				},
				{
					fieldLabel: 'City, State',
					name: 'location',
					value: (location.city) ? location.city : 'San Francisco CA',
					blankText: 'Please enter your city and state, for example, \"San Francisco, CA\"'
				}
			],
			buttons: [
				{
					text: 'Search',
					type: 'submit',
					scope: this,
					handler: validateForm
				}
			],
			keys: {
				key: [10,13],
				fn: validateForm
			}
		});
		
		var store = new Ext.data.JsonStore({
			url: '/proxy/yelp/business-review/',
			baseParams: {
				num_biz_requested: 20,
				radius: 5
			},
			root: 'businesses',
			fields: [
				'name',
				'id',
				'latitude',
				'longitude',
				'review_count',
				'photo_url',
				'photo_url_small',
				'rating_img_url',
				'rating_img_url_small',
				'address1',
				'address2',
				'city',
				'state',
				'zip',
				'phone',
				'url'
			]
		});
		
		var template = new Ext.XTemplate(
			'<tpl for=".">',
			'<div id="{id}" class="result">',
				'<h2>{name}</h2>',
				'<a href="{url}" target="_blank"><img class="photo" src="{photo_url_small}" border="0" /></a>',
				'<div class="ratingAddress">',
					'<p><img src="{rating_img_url_small}" border="0" />&nbsp;<span class="review-count">{review_count} Reviews</span></p>',
					'<p><address>{address1}<br/>{city}, {state} {zip}</address></p>',
				'</div>',
			'</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		);
		
		var resultsPanel = new Ext.DataView({
			region: 'center',
			id: 'results-panel',
			store: store,
			tpl: template,
			singleSelect: true,
			style: 'height: 85%; overflow: auto;',
			loadingText: 'Loading...',
			emptyText: 'No results found.',
			overClass: 'x-view-over',
			itemSelector: 'div.result'
		});
		resultsPanel.on('selectionchange',handleItemSelection);
		
		function handleItemSelection(dataview, selection) {
			//alert(selection[0].id);
			//GEvent.trigger(el,'click');
		}
		
		function selectItem(id) {
			Ext.get(id).scrollIntoView('results-panel',false);
			resultsPanel.select(id, false, true);
		}
		
		function validateForm(btn,e) {
			var _form = Ext.getCmp('criteria-form').getForm();
			if (_form.isValid()) {
				processRequest(_form);
			} else {
				Ext.Msg.alert('Error','Please complete the form before submitting.');
			}
		}
		
		function processRequest(form) {
			var location = form.getValues()['location'];
			var term = form.getValues()['term'];
			if (location) {
				geocoder.getLatLng(location, function(point){
					getMap().setCenter(point,13);
					store.baseParams['term'] = term;
					store.baseParams['lat'] = point.lat();
					store.baseParams['long'] = point.lng();
					store.load({
						callback: handleResults
					});
				});
			}
		}
		
		function handleResults(results,criteria,success) {
			createMarkers(results);
		}
		
		function getMap() {
			var map = Ext.getCmp('map-panel').getMap();
			return map;
		}
		
		function createMarkers(results) {
			var map = getMap();
			map.clearOverlays();
			for (var i=0; i<results.length; i++) {
				var item = results[i].data;
				createMapMarker(item, new google.maps.LatLng(item.latitude, item.longitude), item.id, map);
			}
		}
		
		function createMapMarker(r, point, id, map) {
			var marker = new google.maps.Marker(point,{
				title: r.name,
				id: id
			});
			
			//create info window
			google.maps.Event.addListener(marker, 'click', function(){
				selectItem(this.id);
				this.openInfoWindowHtml(createInfoWindow(r), {
					maxWidth: 800
				});
			});
			
			map.addOverlay(marker);
		}
		
		function createInfoWindow(r) {
			var text = '<div class="marker">';
			text += '<img class="photo" src="' + r.photo_url + '" title="' + r.name + '" />';
			text += '<img class="ratingsimage" src="' + r.rating_img_url + '"/><br/>';
			text += r.review_count + '&nbsp;Reviews<br/><br/>';
			text += '<a href="' + r.url + '" target="_blank" class="name">' + r.name + '</a><br/><br/>';
			text += r.address1 + '<br/>' + r.city + ', ' + r.state + ' ' + r.zip + '<br/><br/>';
			text += USPhoneFormat(r.phone);
			text += '</div>';
			return text;
    	}
		
		function USPhoneFormat(n) {
			var formatted = n;
			if (n.length == 10) {
				formatted = '(' + n.slice(0, 3) + ') ' + n.slice(3, 6) + '-' + n.slice(6, 10);
			}
			return formatted;
		}
		
		var defConfig = {
			renderTo: Ext.getBody(),
			layout: 'border',
			defaults: {
				layout: 'fit',
				collapsible: true,
				split: true,
			},
			items: [
				{
					region: 'west',
					title: 'Restaurant Search',
					width: 300,
					minSize: 300,
					maxSize: 400,
					layout: 'fit',
					autoScroll: false,
					items: [
						searchForm,
						resultsPanel
					]
				},
				{
					region: 'center',
					id: 'map-panel',
					layout: 'fit',
//					title: 'Map',
					collapsible: false,
					xtype: 'gmappanel',
					zoomLevel: 13,
					mapConfOpts: [
						'enableScrollWheelZoom',
						'enableDoubleClickZoom',
						'enableDragging'
					],
					mapControls: [
						new google.maps.MapTypeControl(),
						new google.maps.LargeMapControl(),
						new google.maps.OverviewMapControl()
					],
					setCenter: location
				}
			]
		}
		
		Ext.applyIf(this,defConfig);
		Sample.YelpSearch.superclass.initComponent.call(this);
	},
	
	getLocation: function() {
		var point = {
			lat: 40.735681,
			lng: -73.99043
		};
		
		if (google) {
			var loc = google.loader.ClientLocation;
			if (loc) {
				point['lat']  = loc.latitude;
				point['lng']  = loc.longitude;
				point['city'] = loc.address.city + ', ' + loc.address.region;
			}
		}
		
		return point;
	}
	
});

Ext.onReady(function() {
	if (google) {
		google.load('maps', '2', {
			'nocss': true,
			callback: mapLoaded
		});
	}
	
	function mapLoaded() {
		new Sample.YelpSearch();
	}
});