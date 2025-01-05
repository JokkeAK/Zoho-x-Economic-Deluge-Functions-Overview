string standalone.fetchCustomerGroupNumber(String customerGroupName, Map headersMap)
{
    /*
     * Retrieves the customer group number from E-conomic based on the provided customer group name.
     *
     * @param customerGroupName The name of the customer group to search for in E-conomic.
     * @param headersMap A map containing the necessary HTTP headers for the API request.
     * @return A string representing the customer group number if found; otherwise, an empty string.
     */
    try {
        // Define the API endpoint for fetching customer groups with a page size of 1000
        apiUrlCustomerGroups = "https://restapi.e-conomic.com/customer-groups?pagesize=1000";

        // Make the API request to fetch customer groups
        customerGroupsResponse = standalone.makeApiRequest(apiUrlCustomerGroups, "GET", headersMap, "");

        // Check the HTTP status code to ensure the request was successful
        httpStatusCodeCreate = customerGroupsResponse.get("httpStatusCode");
        if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Fetching Customer Group Number from E-conomic", customerGroupsResponse) == "false") {
            return "";
        }

        // Iterate through the customer groups to find a matching name
        if (customerGroupsResponse.get("collection") != null && !customerGroupsResponse.get("collection").isEmpty()) {
            customerGroupList = customerGroupsResponse.get("collection");
            for each group in customerGroupList
            {
                    if(group.get("name") != null && group.get("name").toLowerCase() == customerGroupName.toLowerCase())
                {
                return group.get("customerGroupNumber");
            }
        }
    }

        // If no matching customer group is found
        info "No matching customer group found in E-conomic for customer group: " + customerGroupName;
}
    catch (e) {
        info "Error fetching customer groups from E-conomic: " + e.toString();
}
return "";
}
