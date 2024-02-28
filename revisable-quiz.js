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
  
			// Function to update answer values on component click
			function handleComponentClick(component) {
			  const tags = component.tags;
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
  
			  if (valueTag) {
				const answer = valueTag.slice(6); // Renamed variable
				const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0;
  
				console.log(`Component clicked: ${answer} (variation: ${variation})`);
				resultValues[answer] = (resultValues[answer] || 0) + variation;
			  } else {
				console.warn(`Component missing "value:" tag for answer tracking.`);
			  }
			}
  
			// Function to determine the most common answer
			function findMostCommonAnswer() { // Renamed function
			  const max = Math.max(...Object.values(resultValues));
			  const mostCommonAnswers = Object.keys(resultValues).filter(
				(answer) => resultValues[answer] === max
			  );
			  return mostCommonAnswers.length > 1 ? mostCommonAnswers[0] : mostCommonAnswers[0];
			}
  
			// Function to handle "goto:results" click and navigate to result page
			function handleResultsClick() {
			  const mostCommonAnswer = findMostCommonAnswer();
			  console.log(`Most common answer: ${mostCommonAnswer}`);
			  const resultPage = experience.findPagesByTag(mostCommonAnswer)[0];
			  console.log(`Navigating to result page: ${resultPage}`);
			  experience.goToPage(resultPage);
			}
  
			// Initialize answer values and result pages based on tags
			const answers = experience.findComponentsByTag("answer").components; // Renamed variable
			console.log("Answers:");
			console.log(answers);
  
			answers.forEach((answer) => {
			  const tags = answer.tags;
  
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  if (!valueTag) {
				console.warn(`Component missing "value:" tag for answer tracking.`);
				return;
			  }
  
			  const result = valueTag.slice(6); // Renamed variable
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
			  const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0;
  
			  resultValues[result] = (resultValues[answer] || 0) + variation;
  
			  const resultLetter = variationTag ? variationTag.slice(-1) : result;
			  resultPages[`result-${resultLetter}`] = experience.findComponentsByTag("results", resultLetter)[0];
			  console.log(`Found result page for answer ${answer}: ${resultPages[`result-${resultLetter}`]}`);
			});
  
			// Add click event listeners to answer components
			answers.forEach((answer) => {
			  answer.addEventListener("click", () => handleComponentClick(answer));
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
  