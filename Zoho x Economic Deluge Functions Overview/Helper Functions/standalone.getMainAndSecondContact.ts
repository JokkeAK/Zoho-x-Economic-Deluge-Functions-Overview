string standalone.getMainAndSecondContact(string moduleName, string recordId)
{
	/*
	 * Gets the number of the main contact and the name of the second contact for API related requests.
	 *
	 * @param moduleName The module name (e.g., "Visiana_Quotes" or "Visiana_Invoices")
	 * @param recordId The ID of the specific record (quote or invoice).
	 * @return String containing the number of the main contact and the name of the second contact if successful or an error message if not.
	 */
	try {
		recordDetails = zoho.crm.getRecordById(moduleName, recordId);
		// Extract main and second contact from the quote
		mainContactId = recordDetails.get("Main_Contact").get("id");
		if (mainContactId == null) {
			return "Error: Main contact not found.";
		}
		mainContactInfo = zoho.crm.getRecordById("Contacts", mainContactId);
		mainContactCustomerContactNumber = mainContactInfo.get("Customer_Contact_Number");
		// Handle second contact
		secondContact = standalone.getFieldValueWithDefault(recordDetails, "Second_Contact", "").toString();
		if (secondContact == "") {
			info "Second contact not found.";
			secondContactName = "";
		}
		else {
			secondContactName = secondContact.get("name");
		}
		nameList = List();
		nameList.add(mainContactCustomerContactNumber);
		nameList.add(secondContactName);
		return nameList;
	}

	catch (e) {
		return "Error: Unexpected error in standalone.getMainAndSecondContact: " + e.toString();
	}
	return "Error: Unexpected error in standalone.getMainAndSecondContact.";
}