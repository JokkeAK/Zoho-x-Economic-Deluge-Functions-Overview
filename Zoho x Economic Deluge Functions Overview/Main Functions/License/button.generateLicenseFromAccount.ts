string button.generateLicenseFromAccount(String accountId)
{
    /*
     * Generates a license record in Zoho CRM based on the associated account.
     *
     * @param accountId The ID of the account record in Zoho CRM.
     * @return A string indicating the success or failure of the license creation process.
    */
    try {
        // Get the current user's information (the one who clicks the button)
        userResp = zoho.crm.getRecords("users", 1, 200, { "type": "ActiveUsers" });
        users = userResp.getJSON("users");
        currentUserEmail = zoho.loginuserid;
        currentUserName = zoho.loginuser;
        currentUserId = "";
        for each user in users
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

    // Get the update values from the account
    accountDetails = zoho.crm.getRecordById("Accounts", accountId);
    accountName = accountDetails.get("Account_Name");

    // Create the license data map
    licenseData = Map();
    licenseData.put("Name", "License for: " + accountName);
    licenseData.put("Account", accountId);
    licenseData.put("Status", "To Do");
    licenseData.put("Owner", currentUserId);
    licenseData.put("True_Created_By", currentUserName);
        //licenseData.put("True_Modified_By",currentUserName);
        info licenseData;

    // Create the license with the mapping data
    licenseCreationResponse = zoho.crm.createRecord("Licenses", licenseData);
        info licenseCreationResponse;

    if (licenseCreationResponse.get("id") != null) {
            info "License created successfully with ID: " + licenseCreationResponse.get("id");
        // Navigate to the URL of the created license by opening a new tab. 
        openUrl("https://crm.zoho.eu/crm/org20067606526/tab/CustomModule2/" + licenseCreationResponse.get("id"), "same window");
        return "License created successfully.";
    }
    else {
            info "Error creating license: " + licenseCreationResponse;
        return "Error creating license.";
    }
}
    catch (e) {
        info "Error creating the license from the account: " + e.toString();
    return "Error creating license.";
}
}
