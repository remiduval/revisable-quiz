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
			const resultsScores = {}; // Renamed variable
			//const resultPages = {};
  
			// Function to parse variation value from "variation:X" tag
			// function parseVariation(variationTag) {
			//   const parts = variationTag.split(":");
			//   return parseInt(parts[1]);
			// }
  
			// Function to update answer values on component click
			function handleComponentClick(component) {
			  const tags = component.tags;
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
  
			  if (valueTag) {
				const answer = valueTag.slice(6); // Renamed variable
				const variationPattern = /variation:[-+]?\d+$/;
				const variation = variationTag && variationTag.match(variationPattern) ? parseInt(variationTag.slice(10), 10) : 0;
  
				console.log(`Component clicked: ${answer} (variation: ${variation})`);
				resultsScores[answer] = (resultsScores[answer] || 0) + variation;
			  } else {
				console.warn(`Component missing "value:" tag for answer tracking.`);
			  }
			}
  
			// Function to determine the most common answer
			function findMostCommonAnswer() { // Renamed function
			  const max = Math.max(...Object.values(resultsScores));
			  const mostCommonAnswers = Object.keys(resultsScores).filter(
				(answer) => resultsScores[answer] === max
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
  
			  resultsScores[result] = (resultsScores[answer] || 0) + variation;
  
			  //const resultLetter = variationTag ? variationTag.slice(-1) : result;
			  //resultPages[`result-${resultLetter}`] = experience.findComponentsByTag("results", resultLetter)[0];
			  //console.log(`Found result page for answer ${answer}: ${resultPages[`result-${resultLetter}`]}`);
			});
  
			// Track clicks on all components
			var componentClickedCallback = function(component){
				console.log(`Component clicked: ${component.id}`);

				if (component.tags.includes("answer")) {
					handleComponentClick(component);
				} else if (component.tags.includes("goto:results")) {
					handleResultsClick();
				}
			}
			experience.on(CerosSDK.EVENTS.CLICKED, componentClickedCallback);

		  });
	});
  })();
  