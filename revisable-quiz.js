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
			const answerValues = {};
			const resultPages = {};
  
			// Function to parse variation value from "variation:X" tag
			function parseVariation(variationTag) {
			  const parts = variationTag.split(":");
			  return parseInt(parts[1]);
			}
  
			// Function to update answer values on component click
			function handleComponentClick(component) {
			  const tags = component.tags; // Get tags from component
			  const valueTag = tags.find((tag) => tag.startsWith("value:")); // Find "value:" tag
			  const variationTag = tags.find((tag) => tag.startsWith("variation:")); // Find "variation:" tag
  
			  if (valueTag) {
				const answer = valueTag.slice(6); // Extract answer letter from "value:X"
				const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0; // Extract variation if present
  
				console.log(`Component clicked: ${answer} (variation: ${variation})`);
				answerValues[answer] = (answerValues[answer] || 0) + variation;
			  } else {
				console.warn(`Component missing "value:" tag for answer tracking.`);
			  }
			}
  
			// Function to determine the most common answer
			function findMostCommonAnswer() {
			  const max = Math.max(...Object.values(answerValues));
			  const mostCommonAnswers = Object.keys(answerValues).filter(
				(answer) => answerValues[answer] === max
			  );
			  return mostCommonAnswers.length > 1 ? mostCommonAnswers[0] : mostCommonAnswers[0];
			}
  
			// Function to handle "goto:results" click and navigate to result page
			function handleResultsClick() {
			  const mostCommonAnswer = findMostCommonAnswer();
			  const resultPage = Object.keys(resultPages).find(
				(page) => page.slice(1) === mostCommonAnswer
			  );
			  CerosSDK.navigateToPage(resultPage);
  
			  console.log(`Most common answer: ${mostCommonAnswer}`);
			  console.log(`Navigating to result page: ${resultPage}`);
			}
  
			// Initialize answer values and result pages based on tags
			const components = experience.findComponentsByTag("answer").components; // Access nested components
			console.log("Components:");
			console.log(components); // Output the components variable
  
			components.forEach((component) => {
			  const tags = component.tags; // Get tags from component
  
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  if (!valueTag) {
				console.warn(`Component missing "value:" tag for answer tracking.`);
				return; // Skip component if "value:" tag is missing
			  }
  
			  const answer = valueTag.slice(6); // Extract answer letter from "value:X"
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
			  const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0; // Extract variation if present
  
			  answerValues[answer] = (answerValues[answer] || 0) + variation;
  
			  const resultLetter = variationTag ? variationTag.slice(-1) : answer;
			  resultPages[`result-${resultLetter}`] = experience.findComponentsByTag("results", resultLetter)[0];
			  console.log(`Found result page for answer ${answer}: ${resultPages[`result-${resultLetter}`]}`);
			});
  
			// Add click event listeners to answer components
			components.forEach((component) => {
			  component.addEventListener("click", () => handleComponentClick(component));
			});
  
			// Maintain components for "goto:results" element
			const resultsComponent = experience.findComponentsByTag("goto:results")[0];
			resultsComponent.addEventListener("click", handleResultsClick);
		  });
	});
  })();