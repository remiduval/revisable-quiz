
(function() {
  'use strict';

  require.config({
	paths: {
	  CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
	},
  });

  require(['CerosSDK'], function(CerosSDK) {
	CerosSDK.findExperience()
		.fail(function(error) {
			console.error("Error finding Ceros experience:", error);
		})
		.done(function(experience) {
			console.log("hi");
			console.log(experience.findComponentsByTag("answer"));
			console.log(experience.findLayersByTag("answer"));

			const components = experience.findComponentsByTag("answer");
			//const layers = experience.findLayersByTag("answer");
			console.log(`Found ${components.components.length} answer components`);          
			//console.log(`Found ${layers.length} answer layers`);
		});
  });
})();

