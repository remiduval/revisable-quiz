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
			  const tags = component.tags;
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
  
			  if (valueTag) {
				const answer = valueTag.slice(6);
				const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0;
  
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
			const answers = experience.findComponentsByTag("answer").components;
			console.log("Answers:");
			console.log(answers);
  
			answers.forEach((answer) => {
			  const tags = answer.tags;
  
			  const valueTag = tags.find((tag) => tag.startsWith("value:"));
			  if (!valueTag) {
				console.warn(`Component missing "value:" tag for answer tracking.`);
				return;
			  }
  
			  const answer = valueTag.slice(6);
			  const variationTag = tags.find((tag) => tag.startsWith("variation:"));
			  const variation = variationTag ? parseVariation(variationTag.slice(11)) : 0;
  
			  answerValues[answer] = (answerValues[answer] || 0) + variation;
  
			  const resultLetter = variationTag ? variationTag.slice(-1) : answer;
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
  