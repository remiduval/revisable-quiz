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
			const resultValues = {}; // Renamed variable
			const resultPages = {};
  
			// Function to parse variation value from "variation:X" tag
			function parseVariation(variationTag) {
			  const parts = variationTag.split(":");
			  return parseInt(parts[1]);
			}
  
			// Function to update result values on component click
			function handleComponentClick(component) {
			  const tags = component.tags;
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
  
			  if (valueTag) {
				const result = valueTag.slice(6); // Renamed variable
				const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0;
  
				console.log(`Component clicked: ${result} (variation: ${variation})`);
				resultValues[result] = (resultValues[result] || 0) + variation;
			  } else {
				console.warn(`Component missing "value:" tag for result tracking.`);
			  }
			}
  
			// Function to determine the most common result
			function findMostCommonResult() { // Renamed function
			  const max = Math.max(...Object.values(resultValues));
			  const mostCommonResults = Object.keys(resultValues).filter(
				(result) => resultValues[result] === max
			  );
			  return mostCommonResults.length > 1 ? mostCommonResults[0] : mostCommonResults[0];
			}
  
			// Function to handle "goto:results" click and navigate to result page
			function handleResultsClick() {
			  const mostCommonResult = findMostCommonResult();
			  const resultPage = Object.keys(resultPages).find(
				(page) => page.slice(1) === mostCommonResult
			  );
			  CerosSDK.navigateToPage(resultPage);
  
			  console.log(`Most common result: ${mostCommonResult}`);
			  console.log(`Navigating to result page: ${resultPage}`);
			}
  
			// Initialize result values and result pages based on tags
			const results = experience.findComponentsByTag("result").components; // Renamed variable
			console.log("Results:");
			console.log(results);
  
			results.forEach((result) => {
			  const tags = result.tags;
  
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  if (!valueTag) {
				console.warn(`Component missing "value:" tag for result tracking.`);
				return;
			  }
  
			  const result = valueTag.slice(6); // Renamed variable
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
			  const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0;
  
			  resultValues[result] = (resultValues[result] || 0) + variation;
  
			  const resultLetter = variationTag ? variationTag.slice(-1) : result;
			  resultPages[`result-${resultLetter}`] = experience.findComponentsByTag("results", resultLetter)[0];
			  console.log(`Found result page for result ${result}: ${resultPages[`result-${resultLetter}`]}`);
			});
  
			// Add click event listeners to result components
			results.forEach((result) => {
			  result.addEventListener("click", () => handleComponentClick(result));
			});
  
			// Track clicks on all components
			experience.on(CerosSDK.EVENTS.CLICKED, (component) => {
			  console.log(`Component clicked: ${component.name}`);
			  if (component.tags.includes("value:")) {
				handleComponentClick(component);
			  } else if (component.name === "goto:results") {
				handleResultsClick();
			  }
			});  
		  });
	});
  })();
  