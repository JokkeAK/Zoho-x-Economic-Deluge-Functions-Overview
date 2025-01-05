string button.generateQuoteFromLicense(String licenseId)
{
	/*
		 * Generates a quote in Zoho CRM based on the provided license and registers it in E-conomic.
		 *
		 * @param licenseId The ID of the license record in Zoho CRM.
		 * @return A string indicating the success or failure of the quote creation process.
		 */
	try {
		// Get the current user's information (the one who clicks the button)
		userResp = zoho.crm.getRecords("users", 1, 200, { "type": "ActiveUsers" });
		users = userResp.getJSON("users");
		currentUserEmail = zoho.loginuserid;
		currentUserName = zoho.loginuser;
		currentUserId = "";
		for each  user in users
	{
				userName = user.get("name");
				userEmail = user.get("email");
				userId = user.get("id");
				if(userEmail == currentUserEmail) {
			currentUserId = userId;
			break;
		}
	}
	info userResp;
	// Get the update values from the license
	licenseDetails = zoho.crm.getRecordById("Licenses", licenseId);
	licenseName = licenseDetails.get("Name");
	licenseAccount = licenseDetails.get("Account");
	licenseCredits = licenseDetails.get("Credits");
	licenseUnitPrice = licenseDetails.get("Credit_Price");
	licenseDiscountType = licenseDetails.get("Discount_Type");
	licenseDiscountValue = licenseDetails.get("Discount_Value");
	licenseDiscountedCredits = licenseDetails.get("Discounted_Credits");
	// Get the update values from the account
	accountDetails = zoho.crm.getRecordById("Accounts", licenseAccount.get("id"));
	accountVat = accountDetails.get("VAT");
	accountMainContact = accountDetails.get("Main_Contact");
	accountSecondContact = accountDetails.get("Second_Contact");
	accountThirdContact = accountDetails.get("Third_Contact");
	// Create the update map
	quoteData = Map();
	quoteData.put("Quote_Stage", "Draft");
	quoteData.put("Owner", currentUserId);
	quoteData.put("Account_Name", licenseAccount);
	quoteData.put("Name", "Quote for: " + licenseAccount.get("name"));
	quoteData.put("VAT", accountVat);
	quoteData.put("Main_Contact", accountMainContact);
	quoteData.put("Second_Contact", accountSecondContact);
	quoteData.put("Third_Contact", accountThirdContact);
	quoteData.put("License_Name", licenseId);
	quoteData.put("Credits", licenseCredits);
	quoteData.put("Credit_Price", licenseUnitPrice);
	quoteData.put("Discount_Type", licenseDiscountType);
	quoteData.put("Discount_Value", licenseDiscountValue);
	quoteData.put("Discounted_Credits", licenseDiscountedCredits);
	quoteData.put("True_Created_By", currentUserName);
	//quoteData.put("True_Modified_By",currentUserName);
	info quoteData;
	// Create the quote with the mapping data
	quoteCreationResponse = zoho.crm.createRecord("Visiana_Quotes", quoteData);
	if (quoteCreationResponse.get("id") != null) {
		info "Quote created successfully with ID: " + quoteCreationResponse.get("id");
		// Navigate to the URL of the created quote by opening a new tab. 
		openUrl("https://crm.zoho.eu/crm/org20067606526/tab/CustomModule9/" + quoteCreationResponse.get("id"), "same window");
		// Call the standalone function for creating a quote in E-conomic
		createResponse = standalone.createQuoteInEconomic(quoteCreationResponse.get("id"), accountDetails.get("id"));

		if (createResponse.contains("Error")) {
			return "Error creating quote: " + createResponse;
		}
		else {
			return "Quote created successfully.";
		}
	}
	else {
		info "Error creating quote: " + quoteCreationResponse;
		return "Error creating quote.";
	}
}
catch (e) {
	info "Error creating the quote from the license: " + e.toString();
	return "Error creating quote: " + e.toString();
}
}