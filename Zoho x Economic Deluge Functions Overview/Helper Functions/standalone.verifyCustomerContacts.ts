string standalone.verifyCustomerContacts(String customerNumber, String mainContactCustomerContactNumber, Map headersMap)
{
	/*
		 * Verifies that the customer in E-conomic has the same contact listed as main contact in Zoho CRM and gets the E-conomic customer contact number.
		 *
		 * @param customerNumber The number of the customer in Zoho CRM.
		 * @param mainContactCustomerContactNumber The number of the main contact for the quote or invoice.
		 * @param headersMap Map containing the headers for the API request.
		 * @return String of the E-conomic customer contact number if successful or an error message if not.
		 */
	try {
		// Fetch customer contacts from E-conomic
		apiUrlCustomerContacts = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts";
		customerContactsResponse = standalone.makeApiRequest(apiUrlCustomerContacts, "GET", headersMap, "");
		httpStatusCodeCreate = customerContactsResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Fetching all customer contacts from E-conomic", customerContactsResponse) == "false") {
			return "Error: GET request failed.";
		}
		// Check if 'collection' exists and is not empty
		if (customerContactsResponse.get("collection") == null || customerContactsResponse.get("collection").isEmpty()) {
			return "Error: No customer contacts found in E-conomic for customer number: " + customerNumber.toString();
		}
		customerContactsList = customerContactsResponse.get("collection");
		// Map Zoho CRM main contact to E-conomic customer contact
		economicCustomerContactNumber = 0;
		for each  contact in customerContactsList
	{
				if(mainContactCustomerContactNumber != null && contact.get("customerContactNumber") != null && mainContactCustomerContactNumber == contact.get("customerContactNumber")) {
			economicCustomerContactNumber = mainContactCustomerContactNumber;
			return economicCustomerContactNumber;
		}
	}
	if (economicCustomerContactNumber == 0) {
		return "Error: Found no match of the customer contact numbers between Zoho CRM and E-conomic";
	}
}
catch (e) {
	return "Error: Unexpected error in standalone.verifyCustomerContacts: " + e.toString();
}
return "Error: Unexpected error in standalone.verifyCustomerContacts.";
}