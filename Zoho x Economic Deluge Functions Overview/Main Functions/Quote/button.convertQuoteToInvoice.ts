string button.convertQuoteToInvoice(String quoteId)
{
	/*
		 * Converts a quote to an invoice in Zoho CRM and registers the conversion in E-conomic.
		 *
		 * @param quoteId The ID of the quote record in Zoho CRM.
		 * @return A string indicating the success or failure of the conversion process.
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
	// Get the update values from the quote
	quoteDetails = zoho.crm.getRecordById("Visiana_Quotes", quoteId);
	// Verify that the quote has not already been converted
	quoteConverted = quoteDetails.get("Converted_To_Invoice");
	if (quoteConverted != null) {
		return "The quote has already been converted to an invoice. Cannot convert it again.";
	}

	// Get all of the quote data
	quoteNumber = quoteDetails.get("Quote_Number");
	quoteAccount = quoteDetails.get("Account_Name");
	quoteOwner = quoteDetails.get("Owner");
	quoteMainContact = quoteDetails.get("Main_Contact");
	quoteSecondContact = quoteDetails.get("Second_Contact");
	quoteThirdContact = quoteDetails.get("Third_Contact");
	quoteSubTotal = quoteDetails.get("Sub_Total");
	quoteVatAmount = quoteDetails.get("VAT_Amount");
	quoteTotalPriceWithVAT = quoteDetails.get("Total_Price_w_VAT");
	quoteLicenseName = quoteDetails.get("License_Name");
	quoteCreditPrice = quoteDetails.get("Credit_Price");
	quoteCredits = quoteDetails.get("Credits");
	quoteDiscountType = quoteDetails.get("Discount_Type");
	quoteDiscountValue = quoteDetails.get("Discount_Value");
	quoteDiscountedCredits = quoteDetails.get("Discounted_Credits");
	quoteExtraQuotedItems = quoteDetails.get("Extra_Quoted_Items_Quo");
	quoteResearchLicense = quoteDetails.get("For_Research_Purposes_Only");
	//info quoteDetails;
	//info quoteExtraQuotedItems;
	// Get the update values from the account
	accountDetails = zoho.crm.getRecordById("Accounts", quoteAccount.get("id"));
	accountVat = accountDetails.get("VAT");
	accountId = accountDetails.get("id");

	// Call the standalone function for converting a quote to an invoice in E-conomic and get the draft invoice number from E-conomic as the response
	convertResponse = standalone.convertQuoteToInvoiceInEconomic(quoteId, accountId);
	// Check the response
	if (convertResponse.contains("Error")) {
		return convertResponse;
	}

	// Retrieve E-conomic API tokens and set up HTTP headers 
	headersMap = standalone.setUpApiHeaders();
	if (headersMap == "") {
		// Tokens not found; exit the function to prevent further errors
		info "Failed to retrieve API tokens.";
		return "Error: Failed to retrieve API tokens.";
	}
	// Create the update map
	invoiceData = Map();
	invoiceData.put("Converted_From_Quote", quoteId);
	invoiceData.put("Invoice_Number", convertResponse);
	//invoiceData.put("Quote_Origin_Number",quoteNumber);
	invoiceData.put("Name", "Invoice for: " + quoteAccount.get("name"));
	invoiceData.put("Invoice_Stage", "Draft");
	invoiceData.put("Account_Name", quoteAccount);
	invoiceData.put("Owner", quoteOwner);
	invoiceData.put("Main_Contact", quoteMainContact);
	invoiceData.put("Second_Contact", quoteSecondContact);
	invoiceData.put("Third_Contact", quoteThirdContact);
	invoiceData.put("Sub_Total", quoteSubTotal);
	invoiceData.put("VAT", accountVat);
	invoiceData.put("VAT_Amount", quoteVatAmount);
	invoiceData.put("Total_Price_w_VAT", quoteTotalPriceWithVAT);
	invoiceData.put("License_Name", quoteLicenseName.get("id"));
	invoiceData.put("Credit_Price", quoteCreditPrice);
	invoiceData.put("Credits", quoteCredits);
	invoiceData.put("Discount_Type", quoteDiscountType);
	invoiceData.put("Discount_Value", quoteDiscountValue);
	invoiceData.put("Discounted_Credits", quoteDiscountedCredits);
	invoiceData.put("Extra_Quoted_Items_Inv", quoteExtraQuotedItems);
	invoiceData.put("For_Research_Purposes_Only", quoteResearchLicense);
	invoiceData.put("True_Created_By", currentUserName);
	info invoiceData;
	// Create the invoice with the mapping data
	invoiceCreationResponse = zoho.crm.createRecord("Visiana_Invoices", invoiceData);
	invoiceId = invoiceCreationResponse.get("id");
	if (invoiceId != null) {
		info "Invoice created successfully with ID: " + invoiceId;
		// Navigate to the URL of the created invoice by opening a new tab. 
		openUrl("https://crm.zoho.eu/crm/org20067606526/tab/CustomModule21/" + invoiceCreationResponse.get("id"), "same window");
		// Update the original quote to say it is converted and thus locked for further editing.
		updateMap = Map();
		updateMap.put("Converted_To_Invoice", invoiceId);
		updateResponse = zoho.crm.updateRecord("Visiana_Quotes", quoteId, updateMap);
		return "Converted to invoice.";

	}
	else {
		return "Error: Error converting to invoice. " + invoiceCreationResponse;
	}
}
catch (e) {
	return "Error: Error converting to invoice: " + e.toString();
}
}