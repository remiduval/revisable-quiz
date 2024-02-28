
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
const layers = experience.findComponentsByTag("answer");
          console.log(`Found ${layers.length} answer layers`);
        });
  });
})();

