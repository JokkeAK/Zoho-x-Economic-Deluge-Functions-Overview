void automation.updateEconomicInvoice(String invoiceId, String accountId)
{
	/*
		 * Updates an existing invoice in E-conomic based on the invoice details from Zoho CRM.
		 *
		 * @param invoiceId The ID of the invoice record in Zoho CRM.
		 * @param accountId The ID of the associated account record in Zoho CRM.
		 */
	try {
		// Retrieve E-conomic API tokens and set up HTTP headers
		headersMap = standalone.setUpApiHeaders();
		if (headersMap == "") {
		// Tokens not found; exit the function to prevent further errors
		info "Failed to retrieve API tokens.";
			return;
		}
		// Fetch invoice details from Zoho CRM
		invoiceDetails = zoho.crm.getRecordById("Visiana_Invoices", invoiceId);
		if (invoiceDetails == null) {
		info "Invoice record not found.";
			return;
		}
		// Retrieve invoice owner's information from the invoice
		invoiceOwner = invoiceDetails.get("Owner");
	info invoiceOwner;
		if (invoiceOwner == null || invoiceOwner == "") {
		info "Invoice owner not found in the invoice.";
			return;
		}
		invoiceOwnerName = invoiceOwner.get("name");
		// Fetch account information
		accountDetails = zoho.crm.getRecordById("Accounts", accountId);
		if (accountDetails == null) {
		info "Account record not found.";
			return;
		}
		// Extract account-related fields
		accountCurrency = accountDetails.get("Currency_Type");
		accountName = accountDetails.get("Account_Name");
		billingStreet = accountDetails.get("Billing_Street");
		billingCity = accountDetails.get("Billing_City");
		billingCode = accountDetails.get("Billing_Code");
		billingCountry = accountDetails.get("Billing_Country");
		customerNumber = accountDetails.get("Customer_Number");
		// Extract main and second contact from the invoice
		contactList = standalone.getMainAndSecondContact("Visiana_Invoices", invoiceId).toList();
		// Check that the contact list was created successfully
		if (contactList.contains("Error")) {
			return;
		}
		mainContactCustomerContactNumber = contactList.get(0);
		secondContactName = contactList.get(1);
		// Get the E-conomic employee number for the invoice owner
		economicEmployeeNumber = standalone.getEconomicEmployeeNumber(invoiceOwnerName, headersMap).toNumber();
		// Check that the number has been retrieved correctly
		if (economicEmployeeNumber.contains("Error")) {
			return;
		}
		// Verify that the customer contacts are the same both in E-conomic and Zoho, and get the customer contact number from E-conomic for the main contact in Zoho CRM
		economicCustomerContactNumber = standalone.verifyCustomerContacts(customerNumber, mainContactCustomerContactNumber, headersMap).toNumber();
		// Check that the number has been retrieved correctly
		if (economicCustomerContactNumber.contains("Error")) {
			return;
		}
		// Get all of the line items for the invoice
		lineItems = standalone.prepareLineItems("Visiana_Invoices", invoiceId, "Extra_Quoted_Items_Inv").toList();
		// Check that line items has been prepared
		if (lineItems == null || lineItems == "") {
			return;
		}
		// Fetch vatZoneNumber
		vatZoneName = standalone.getFieldValueWithDefault(accountDetails, "VAT_Zone", "");
		vatZoneNumber = 0;
		if (vatZoneName != "") {
			vatZoneNumber = standalone.fetchVatZoneNumber(vatZoneName, headersMap).toNumber();
		info "Found VAT zone number: " + vatZoneNumber;
		}
		// Fetch paymentTermsNumber
		paymentTermsName = standalone.getFieldValueWithDefault(accountDetails, "Payment_Terms", "");
		paymentTermsNumber = 0;
		if (paymentTermsName != "") {
			paymentTermsNumber = standalone.fetchPaymentTermsNumber(paymentTermsName, headersMap).toNumber();
		info "Found payment term number: " + paymentTermsNumber;
		}
		// Prepare invoice data
		invoiceData = { "currency": accountCurrency, "date": zoho.currentdate.toString("yyyy-MM-dd"), "paymentTerms": { "paymentTermsNumber": paymentTermsNumber }, "notes": { "heading": "BoneXpert License" }, "customer": { "customerNumber": customerNumber }, "recipient": { "name": accountName, "address": billingStreet, "zip": billingCode, "city": billingCity, "country": billingCountry, "vatZone": { "vatZoneNumber": vatZoneNumber }, "nemHandelType": "corporateIdentificationNumber" }, "references": { "other": secondContactName, "salesPerson": { "employeeNumber": economicEmployeeNumber }, "customerContact": { "customerContactNumber": economicCustomerContactNumber } }, "layout": { "layoutNumber": 9 }, "lines": lineItems };
		// Update the invoice in E-conomic
		apiUrlInvoiceUpdate = "https://restapi.e-conomic.com/invoices/drafts/" + invoiceDetails.get("Invoice_Number");
		updateInvoiceResponse = standalone.makeApiRequest(apiUrlInvoiceUpdate, "PUT", headersMap, invoiceData);
		// Check the HTTP status code
		httpStatusCodeUpdate = updateInvoiceResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating invoice in E-conomic", updateInvoiceResponse) == "false") {
		// If handling the status code returns false, exit the function
		info "PUT request failed while updating invoice.";
			return;
		}
	}
	catch (e) {
	info "Error in updateEconomicInvoice: " + e.toString();
	}
}