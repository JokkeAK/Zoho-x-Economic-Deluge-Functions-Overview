string standalone.getEconomicEmployeeNumber(String recordOwnerName, Map headersMap)
{
	/*
		 * Gets the employee number from E-conomic based on the quote owner's name.
		 *
		 * @param recordOwnerName The name of the record owner
		 * @param headersMap Map containing the headers for the API request
		 * @return A string containing the employee number if successful or an error message if not.
		 */
	try {
		// Fetch all employees from E-conomic
		apiUrlEmployees = "https://restapi.e-conomic.com/employees";
		employeesResponse = standalone.makeApiRequest(apiUrlEmployees, "GET", headersMap, "");
		// Check the HTTP status code
		httpStatusCodeCreate = employeesResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Fetching all employees from E-conomic", employeesResponse) == "false") {
			// If handling the status code returns false, exit the function
			return "Error: GET request failed while fetching employees.";
		}
		// Check if employees are retrieved successfully
		if (employeesResponse.get("collection") == null || employeesResponse.get("collection").isEmpty()) {
			return "Error: No employees found in E-conomic.";
		}
		employeesList = employeesResponse.get("collection");
		// Find employeeNumber based on the quote owner's name
		economicEmployeeNumber = 0;
		for each  employee in employeesList
	{
				if(employee.get("name") != null && employee.get("name").toLowerCase() == recordOwnerName.toLowerCase())
		{
			economicEmployeeNumber = employee.get("employeeNumber");
			break;
		}
	}
	if (economicEmployeeNumber == 0) {
		return "Error: No matching employee found in E-conomic for quote owner: " + recordOwnerName;
	}
	else {
		return economicEmployeeNumber;
	}
}
catch (e) {
	return "Error: Unexpected error in standalone.getEconomicEmployeeNumber: " + e.toString();
}
return "Error: Unexpected error in standalone.getEconomicEmployeeNumber.";
}