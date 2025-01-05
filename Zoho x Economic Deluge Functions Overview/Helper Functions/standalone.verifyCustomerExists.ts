string standalone.verifyCustomerExists(String customerNumber, Map headersMap)
{
	/*
		 * Verifies whether a customer exists in E-conomic based on the provided customer number.
		 *
		 * @param customerNumber The customer number to verify in E-conomic.
		 * @param headersMap A map containing the necessary HTTP headers for the API request.
		 * @return A string "true" if the customer exists; otherwise, "false".
		 */
	try {
		verifyCustomerURL = "https://restapi.e-conomic.com/customers/" + customerNumber;
		verifyCustomerResponse = standalone.makeApiRequest(verifyCustomerURL, "GET", headersMap, "");
		// Check the HTTP status code to determine if the customer exists
		httpStatusCodeCreate = verifyCustomerResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Verifying that the customer exists in E-conomic", verifyCustomerResponse) == "false") {
			// If handling the status code returns false, customer does not exist
			return "false";
		}
		else if (verifyCustomerResponse == null) {
		info "Failed to verify customer in E-conomic.";
			return "false";
		}
		else if (verifyCustomerResponse.get("customerNumber") != null) {
		info "Customer with customer number " + customerNumber + " already exists in E-conomic.";
			return "true";
		}
		else {
		info "Customer number " + customerNumber + " does not exist in E-conomic.";
			return "false";
		}
	}
	catch (e) {
	info "Error in verifyCustomerExists: " + e.toString();
		return "false";
	}
}