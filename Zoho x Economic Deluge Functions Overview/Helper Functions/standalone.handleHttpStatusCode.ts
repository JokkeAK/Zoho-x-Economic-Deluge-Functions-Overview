string standalone.handleHttpStatusCode(String httpStatusCode, String stepDescription, Map response)
{
	/*
		 * Handles the HTTP status code returned by E-conomic's API and logs appropriate messages.
		 *
		 * @param httpStatusCode The HTTP status code returned by the API call.
		 * @param stepDescription A description of the step being performed (e.g., "Fetching Customer Group Number").
		 * @param response The response map returned by the API call.
		 * @return A string "true" if the HTTP status code indicates success; otherwise, "false".
		 */
	try {
		// Deluge does not have a switch case functionality so we need to use a long if-else.
		if (httpStatusCode == null) {
		// Successful responses from E-conomic's API do not return a HTTP status code
		// But in case that is changed, they are still in the if else statement. 
		info stepDescription + " succeeded. Response: " + response.toString();
			return "true";
		}
		if (httpStatusCode == "200") {
		info stepDescription + " succeeded. Response: " + response.toString();
			return "true";
		}
		else if (httpStatusCode == "201") {
		info stepDescription + " created successfully. Response: " + response.toString();
			return "true";
		}
		else if (httpStatusCode == "204") {
		info stepDescription + " succeeded with no content.";
			return "true";
		}
		else if (httpStatusCode == "400") {
		info stepDescription + " failed: Bad Request. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "401") {
		info stepDescription + " failed: Unauthorized. Check your credentials or tokens. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "403") {
		info stepDescription + " failed: Forbidden. Access denied. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "404") {
		info stepDescription + " failed: Not Found. The requested resource does not exist. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "405") {
		info stepDescription + " failed: Method Not Allowed. Check the HTTP method used. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "415") {
		info stepDescription + " failed: Unsupported Media Type. Ensure you're sending JSON. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "500") {
		info stepDescription + " failed: Internal Server Error. Try again later. Response: " + response.toString();
			return "false";
		}
		else if (httpStatusCode == "501") {
		info stepDescription + " failed: Not Implemented. The requested functionality is not available. Response: " + response.toString();
			return "false";
		}
		else {
		info stepDescription + " encountered an unexpected HTTP status code (" + httpStatusCode + "). Response: " + response.toString();
			return "false";
		}
	}
	catch (e) {
	info "Error in handleHttpStatusCode: " + e.toString();
		return "false";
	}
}