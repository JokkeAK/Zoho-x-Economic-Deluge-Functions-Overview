string standalone.getContactAndAccountDetails(String contactId)
{
	/*
		 * Retrieves contact and associated account details from Zoho CRM.
		 *
		 * @param contactId The ID of the contact record in Zoho CRM.
		 * @return A map containing 'contactDetails', 'accountDetails', and 'customerNumber' if successful; otherwise, null.
		 */
	try {
		// Fetch contact details from Zoho CRM
		contactDetails = zoho.crm.getRecordById("Contacts", contactId);
		if (contactDetails == null) {
		info "Contact record not found for Contact ID: " + contactId;
			return null;
		}
		// Retrieve associated account information
		accountInfo = contactDetails.get("Account_Name");
		if (accountInfo == null) {
			contactName = standalone.getFieldValueWithDefault(contactDetails, "Full_Name", "Unknown");
		info "Associated account not found for contact: " + contactName;
			return null;
		}
		accountId = accountInfo.get("id");
		accountDetails = zoho.crm.getRecordById("Accounts", accountId);
		if (accountDetails == null) {
		info "Account record not found for Account ID: " + accountId;
			return null;
		}
		// Retrieve customer number
		customerNumber = standalone.getFieldValueWithDefault(accountDetails, "Customer_Number", "");
		if (customerNumber == "") {
			accountName = standalone.getFieldValueWithDefault(accountDetails, "Account_Name", "Unknown");
		info "No Economic Customer Number found for account: " + accountName;
			return null;
		}
	info "Economic Customer Number found: " + customerNumber;
		// Prepare and return the retrieved details
		detailsMap = Map();
		detailsMap.put("contactDetails", contactDetails);
		detailsMap.put("accountDetails", accountDetails);
		detailsMap.put("customerNumber", customerNumber);
		return detailsMap;
	}
	catch (e) {
	info "Error in getContactAndAccountDetails: " + e.toString();
		return null;
	}
	return null;
}