(function() {
  // Check if the response body exists to prevent errors
  if (!$response || !$response.body) {
    console.log('No response body found. Script will not run.');
    $done({}); // Finish the script without any changes
    return;
  }

  try {
    // Parse the response body from a JSON string to a JavaScript object
    let bodyObject = JSON.parse($response.body);

    // Check if the 'data' object and the 'hotWord' array exist
    if (bodyObject.data && Array.isArray(bodyObject.data.hotWord)) {
      // Set the 'hotWord' array to be empty
      bodyObject.data.hotWord = [];
      console.log('Successfully removed all hot words.');
    } else {
      console.log('The key "data.hotWord" was not found in the response. No changes made.');
    }

    // Convert the modified JavaScript object back to a JSON string
    const modifiedBody = JSON.stringify(bodyObject);

    // Return the modified body to the application
    $done({ body: modifiedBody });

  } catch (error) {
    console.log('An error occurred while parsing or modifying the JSON: ' + error);
    // If an error occurs (e.g., invalid JSON), return the original response to avoid breaking the app
    $done({});
  }
})();