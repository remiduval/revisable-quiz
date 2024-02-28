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
			  const valueTag = component.dataset.value;
			  const variationTag = component.dataset.variation;
  
			  const answer = valueTag.slice(6); // Extract answer letter from "value:X"
			  const variation = parseVariation(variationTag);
  
			  console.log(`Component clicked: ${answer} (variation: ${variation})`);
			  answerValues[answer] = (answerValues[answer] || 0) + variation;
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
			console.log(`Found ${components.length} answer components`);
			components.forEach((component) => {
			  const valueTag = component.dataset.value;
			  const answer = valueTag.slice(6); // Extract answer letter from "value:X"
			  const variationTag = component.dataset.variation;
			  const variation = parseVariation(variationTag);
  
			  answerValues[answer] = (answerValues[answer] || 0) + variation;
  
			  const resultLetter = component.dataset.variation ? component.dataset.variation.slice(-1) : answer;
			  resultPages[`result-${resultLetter}`] = experience.findComponentsByTag("results", resultLetter)[0]; // Avoid nested components here
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