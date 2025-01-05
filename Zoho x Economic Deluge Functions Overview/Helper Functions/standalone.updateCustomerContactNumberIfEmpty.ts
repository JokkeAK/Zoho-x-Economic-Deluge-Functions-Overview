string standalone.updateCustomerContactNumberIfEmpty(String contactId, Map contactDetails, Map createContactResponse)
{
	/*
		 * Updates the "Customer Contact Number" in Zoho CRM if it's empty, based on the E-conomic response.
		 *
		 * @param contactId The ID of the contact record in Zoho CRM.
		 * @param contactDetails A map containing the contact's details from Zoho CRM.
		 * @param createContactResponse A map containing the response from E-conomic's contact creation API.
		 * @return A string containing the update response if successful, or an empty string if no update was needed.
		 */
	try {
		// Retrieve the current "Customer Contact Number" from Zoho CRM 
		zohoCustomerContactNumber = standalone.getFieldValueWithDefault(contactDetails, "Customer_Contact_Number", "").trim();
		// Retrieve the "customerContactNumber" from E-conomic response 
		economicCustomerContactNumber = createContactResponse.get("customerContactNumber");
	// Log the retrieved numbers for debugging 
	info "Zoho Customer Contact Number: " + zohoCustomerContactNumber;
	info "E-conomic Customer Contact Number: " + economicCustomerContactNumber;
		// Initialize the update map 
		updateMap = Map();
		updateMap.put("Customer_Contact_Number", economicCustomerContactNumber.toString());
		// Check if "Customer Contact Number" is empty 
		if (zohoCustomerContactNumber == "") {
			// Update the "Customer Contact Number" in Zoho CRM 
			update = zoho.crm.updateRecord("Contacts", contactId, updateMap);
		info "Successfully updated 'Customer Contact Number' in Zoho CRM for Contact ID: " + contactId + " to " + economicCustomerContactNumber.toString();
			return update;
			// Successful update
		}
		else {
		info "'Customer Contact Number' already exists for Contact ID: " + contactId + ". No update needed.";
			return "";
			// No update required
		}
	}
	catch (e) {
	info "Error in updateCustomerContactNumberIfEmpty: " + e.toString();
		return "false";
	}
}