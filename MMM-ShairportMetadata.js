/* global Log, Module */

/* Magic Mirror
 * Module: MMM-ShairportMetadata
 *
 * By Prateek Sureka <surekap@gmail.com>
 * MIT Licensed.
 *
 * Forked by ytzeng1
 * A drop-in replacement for compliment module
 * For supported music players, lyrics would be displayed
 */

Module.register("MMM-ShairportMetadata",{

	// Module config defaults.
	defaults: {
		metadataPipe: "/tmp/shairport-sync-metadata",
		alignment: "center"
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
		var self = this;
		// Schedule update timer.
		var playing = null;
		var lastUpdate = new Date().getTime() / 1000;
		this.sendSocketNotification('CONFIG', this.config);
		setInterval(() => {
			this.updateDom(0);
		}, 1000);
	},

	socketNotificationReceived: function(notification, payload){
		if(notification === 'DATA') {
			this.lastUpdate = new Date().getTime() / 1000;

			if ((Object.keys(payload).length == 0)) {
				this.playing = (this.playing == false) ? false : null;
		    }

			if ((Object.keys(payload).length > 0)) {
				this.playing = true;
		    }

		 	if (payload.hasOwnProperty('pause')) {
		 	this.playing = !payload['pause'];
		    }

			this.metadata = payload;
			
			this.updateDom(1000);
		}
	},

	//determines whether the player should hide if there wasn't any update in last 2 minutes
	//probably a bug then.
	shouldHide: function() {
		let now = new Date().getTime() / 1000;
		return (now > (this.lastUpdate + 2 * 60)) ? true : false;
	},


	// Override dom generator.
	getDom: function() {
		var self = this;
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "small";
		alignment = (this.config.alignment == "left") ? "left" : ((this.config.alignment == "right") ? "right" : "center");
		wrapper.setAttribute("style", "text-align:" + alignment + ";")

		if ((!this.metadata || (Object.keys(this.metadata).length == 0)) && this.playing == false){
			wrapper.setAttribute("style", "display:none;");
			return wrapper;
		}

		if (this.shouldHide()) {
			//song is already over and it has been 2 minutes without update
			wrapper.setAttribute("style", "display:none;");
			return wrapper;
		}

		metadata = document.createElement("div");
		
		titletag = document.createElement("div");
		titletag.innerHTML = (this.metadata['Title']) ? this.metadata['Title'] : "";
		titletag.className = "thin xlarge bright pre-line";
		
		metadata.appendChild(titletag);
		metadata.appendChild(document.createElement("BR"));

		var txt = "";
		if (this.metadata['Artist'] || this.metadata['Album Name']){
			txt = this.metadata['Artist'] + " - " + this.metadata['Album Name']
		}
		if (txt.length > 50){
			artisttag = document.createElement('div');
			artisttag.style.fontSize = "10px";
		}else{
			artisttag = document.createElement('div');
		}
		artisttag.innerHTML = txt;
		artisttag.className = "xsmall";
		metadata.appendChild(artisttag)

		wrapper.appendChild(metadata);

		return wrapper;
	},

});
