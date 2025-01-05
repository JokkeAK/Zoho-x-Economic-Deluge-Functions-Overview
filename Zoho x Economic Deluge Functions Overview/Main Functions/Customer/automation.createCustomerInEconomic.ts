void automation.createCustomerInEconomic(String accountId)
{
	/*
		 * Creates a customer in E-conomic based on the account details from Zoho CRM.
		 *
		 * @param accountId The ID of the account record in Zoho CRM.
		 */
	try {
		// Retrieve E-conomic API tokens and set up HTTP headers
		headersMap = standalone.setUpApiHeaders();
		if (headersMap == "") {
		// Tokens not found; exit the function to prevent further errors
		info "Failed to retrieve API tokens.";
			return;
		}
		// Fetch account information
		accountDetails = zoho.crm.getRecordById("Accounts", accountId);
		if (accountDetails == null) {
		info "Account record not found.";
			return;
		}
		// Validate account type
		accountType = accountDetails.get("Account_Type");
		if (accountType != "Customer") {
		info "Account is not of type 'Customer'.";
			return;
		}
		// Check if the account in Zoho CRM already has a customer number tied to E-conomic
		customerNumber = standalone.getFieldValueWithDefault(accountDetails, "Customer_Number", "").toString();
		if (customerNumber != "") {
		info "Existing Customer Number found: " + customerNumber;
			// Verify if the customer number exists in E-conomic
			customerExists = standalone.verifyCustomerExists(customerNumber, headersMap);
			if (customerExists == "true") {
			// Exit to prevent duplicate creation
			info "Customer with customer number " + customerNumber + " already exists in E-conomic.";
				return;
			}
			else {
			info "Customer number " + customerNumber + " does not exist in E-conomic. Proceeding to create a new customer.";
			}
		}
		else {
		info "No existing Customer Number found. Proceeding to create a new customer.";
		}
		// Define field mappings
		// "sourceFields" are the fields from Zoho CRM, and "targetFields" are the fields in E-conomic
		fieldMappings = List();
		fieldMappings.add({ "sourceField": "Company_Registration_Number", "targetField": "corporateIdentificationNumber" });
		fieldMappings.add({ "sourceField": "Account_Name", "targetField": "name" });
		fieldMappings.add({ "sourceField": "Billing_Street", "targetField": "address" });
		fieldMappings.add({ "sourceField": "Billing_Code", "targetField": "zip" });
		fieldMappings.add({ "sourceField": "Billing_City", "targetField": "city" });
		fieldMappings.add({ "sourceField": "Billing_Country", "targetField": "country" });
		fieldMappings.add({ "sourceField": "Phone", "targetField": "telephoneAndFaxNumber" });
		fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
		fieldMappings.add({ "sourceField": "Website", "targetField": "website" });
		fieldMappings.add({ "sourceField": "Currency_Type", "targetField": "currency" });
		// Initialize customerData and populate fields
		customerData = Map();
		for each  mapping in fieldMappings
	{
				sourceValue = standalone.getFieldValueWithDefault(accountDetails, mapping.get("sourceField"), "");
				customerData.put(mapping.get("targetField"), sourceValue);
			}
	info "Customer data map before adding the complex fields: " + customerData.toString();
		// Fetch customer group number from E-conomic
		customerGroupName = standalone.getFieldValueWithDefault(accountDetails, "Customer_Group", "");
		economicCustomerGroupNumber = 0;
		if (customerGroupName != "") {
			economicCustomerGroupNumber = standalone.fetchCustomerGroupNumber(customerGroupName, headersMap).toNumber();
		info "Found customer group number: " + economicCustomerGroupNumber;
		}
		// Fetch paymentTermsNumber
		paymentTermsName = standalone.getFieldValueWithDefault(accountDetails, "Payment_Terms", "");
		paymentTermsNumber = 0;
		if (paymentTermsName != "") {
			paymentTermsNumber = standalone.fetchPaymentTermsNumber(paymentTermsName, headersMap).toNumber();
		info "Found payment term number: " + paymentTermsNumber;
		}
		// Fetch vatZoneNumber
		vatZoneName = standalone.getFieldValueWithDefault(accountDetails, "VAT_Zone", "");
		vatZoneNumber = 0;
		if (vatZoneName != "") {
			vatZoneNumber = standalone.fetchVatZoneNumber(vatZoneName, headersMap).toNumber();
		info "Found VAT zone number: " + vatZoneNumber;
		}
		// Assign Complex Fields
		customerData.put("customerGroup", { "customerGroupNumber": economicCustomerGroupNumber });
		customerData.put("paymentTerms", { "paymentTermsNumber": paymentTermsNumber });
		customerData.put("vatZone", { "vatZoneNumber": vatZoneNumber });
		// Create the Customer in E-conomic
		apiUrlCustomer = "https://restapi.e-conomic.com/customers";
		createCustomerResponse = standalone.makeApiRequest(apiUrlCustomer, "POST", headersMap, customerData);
		// Check the HTTP status code
		httpStatusCodeCreate = createCustomerResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Creating customer in E-conomic", createCustomerResponse) == "false") {
		// If handling the status code returns false, exit the function
		info "POST request failed.";
			return;
		}
		// Store E-conomic customer number in Zoho CRM
		newCustomerNumber = createCustomerResponse.get("customerNumber");
		if (newCustomerNumber == null || newCustomerNumber.toString().trim() == "") {
		info "Customer Number not found in E-conomic. Cannot update the field in Zoho CRM.";
			return;
		}
		else {
		info "Customer number from E-conomic: " + newCustomerNumber + " assigned to customer: " + accountDetails.get("Account_Name");
			updateMap = Map();
			updateMap.put("Customer_Number", newCustomerNumber);
			updateResponse = zoho.crm.updateRecord("Accounts", accountId, updateMap);
			if (updateResponse.get("id") == null) {
			info "Failed to update Customer_Number in Zoho CRM for Account ID: " + accountId;
				return;
			}
		}
		// Synchronize existing contacts
		automation.createCustomerContactsFromRelatedList(accountId);
	}
	catch (e) {
	info "Error in createCustomerInEconomic: " + e.toString();
	}
}