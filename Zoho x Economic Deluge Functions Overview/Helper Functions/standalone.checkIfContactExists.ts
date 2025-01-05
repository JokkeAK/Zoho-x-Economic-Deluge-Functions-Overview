string standalone.checkIfContactExists(Map contactDetails, Map customerContactsResponse, String customerNumber)
{
	/*
		 * Checks if a contact with the given details already exists in E-conomic for a specific customer.
		 *
		 * @param contactDetails A map containing the contact's details from Zoho CRM (e.g., Full_Name, Email).
		 * @param customerContactsResponse A map containing the response from E-conomic's customer contacts API.
		 * @param customerNumber The customer number in E-conomic.
		 * @return A string "true" if the contact exists, "false" otherwise.
		 */
	try {
		// Extract Full_Name and Email
		zohoContactName = standalone.getFieldValueWithDefault(contactDetails, "Full_Name", "").trim();
		zohoContactEmail = standalone.getFieldValueWithDefault(contactDetails, "Email", "").trim();
		// Initialize contactExists flag
		contactExists = false;
		// Validate presence of name and email 
		if (zohoContactName == "" || zohoContactEmail == "") {
		info "Contact name or email is missing. Cannot perform duplication check.";
			return "false";
		}
		// Check if there are existing contacts 
		if (customerContactsResponse.get("collection") != null && !customerContactsResponse.get("collection").isEmpty()) {
			customerContactsList = customerContactsResponse.get("collection");
			for each  eEconomicContact in customerContactsList
		{
					eEconomicContactName = eEconomicContact.get("name");
					eEconomicContactEmail = eEconomicContact.get("email");
					// Validate presence of name and email in existing contact 
					if(eEconomicContactName != null && eEconomicContactEmail != null) {
				// Compare names and emails in lowercase for case-insensitive matching 
				if (zohoContactName.toLowerCase() == eEconomicContactName.toLowerCase() && zohoContactEmail.toLowerCase() == eEconomicContactEmail.toLowerCase()) {
					contactExists = true;
					info "Contact with name '" + zohoContactName + "' and email '" + zohoContactEmail + "' already exists in E-conomic for customer number: " + customerNumber;
					break;
				}
			}
			else
			{
				info "Encountered a contact in E-conomic with missing name or email. Skipping this contact.";
				continue;
			}
		}
	}
	// Return the result 
	if (contactExists) {
		return "true";
	}
	else {
		return "false";
	}
}
catch (e) {
	info "Error occurred in checkIfContactExists: " + e.toString();
	return "false";
}
}